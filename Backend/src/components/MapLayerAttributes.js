import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import { connect } from 'react-redux';
import { processUpdate } from '../actions/admin.actions';
import { MapLayerModel } from '../models';

function MapLayerAttributes(props) {
  const mapLayer = new MapLayerModel(props.mapLayer);

  const [attributes, setAttributes] = useState(mapLayer.initAttributes());
  const onAdd = () => {
    let temp = [ ...attributes ];
    if(mapLayer.rowAttribute()){
      temp.push(mapLayer.rowAttribute());
    }
    setAttributes(temp);
  };
  const onDelete = (i) => {
    let temp = [ ...attributes ];
    temp.splice(i, 1);
    setAttributes(temp);
  };
  const onChange = (i, key, val) => {
    let temp = [ ...attributes ];
    temp[i][key] = val;
    setAttributes(temp);
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    await props.processUpdate('map-layer-attributes', {
      mapLayerId: mapLayer._id,
      attributes: attributes,
    }, true);
  };
  
  /* eslint-disable */
	useEffect(() => {
    if(mapLayer.isValid()){
      if(!mapLayer.attributes || !mapLayer.attributes.length){
        setAttributes(mapLayer.initAttributes());
      }else{
        setAttributes(mapLayer.attributes);
      }
    }
  }, []);
  /* eslint-enable */

  return mapLayer.isValid()? (
    <form onSubmit={onSubmit}>
      <div className="app-card p-0 mt-4">
        <div className="app-card-block">
          <div className="table-wrapper">
            {mapLayer.type === 1? (
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ minWidth: 180 }}>
                      คีย์ข้อมูล <span className="color-danger">*</span>
                    </th>
                    <th style={{ minWidth: 180, width: '100%' }}>
                      ชื่อข้อมูล <span className="color-danger">*</span>
                    </th>
                    <th style={{ minWidth: 140 }}>หน่วย</th>
                    <th style={{ minWidth: 140 }}>ประเภท</th>
                    <th style={{ minWidth: 120 }}>
                      ทศนิยม <span className="color-danger">*</span>
                    </th>
                    <th style={{ minWidth: 100 }} className="text-center">
                      <div onClick={onAdd} className="btn btn-action btn-p btn-xxs ml-2">
                        <em className="fa-solid fa-plus mr-1"></em> เพิ่ม
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attributes.map((d, i) => (
                    <tr key={`attr_${i}`}>
                      <td>
                        <div className="form-control">
                          <input
                            type="text" required={true} value={d.key? d.key: ''} 
                            onChange={e => onChange(i, 'key', e.target.value)} 
                          />
                        </div>
                      </td>
                      <td>
                        <div className="form-control">
                          <input
                            type="text" required={true} value={d.name? d.name: ''} 
                            onChange={e => onChange(i, 'name', e.target.value)} 
                          />
                        </div>
                      </td>
                      <td>
                        <div className="form-control">
                          <input
                            type="text" value={d.unit? d.unit: ''} 
                            onChange={e => onChange(i, 'unit', e.target.value)} 
                          />
                        </div>
                      </td>
                      <td>
                        <div className="form-control">
                          <select 
                            value={d.dataType? d.dataType: 0} 
                            onChange={e => onChange(i, 'dataType', Number(e.target.value))} 
                          >
                            <option value={1}>Text</option>
                            <option value={2}>Number</option>
                          </select>
                        </div>
                      </td>
                      <td>
                        {d.dataType === 2? (
                          <div className="form-control">
                            <input
                              type="number" min={0} step={1} required={true} 
                              value={d.digits || d.digits===0? d.digits: ''} 
                              onChange={e => onChange(i, 'digits',
                                e.target.value || e.target.value===0? Number(e.target.value): ''
                              )} 
                            />
                          </div>
                        ): (<></>)}
                      </td>
                      <td className="text-center">
                        {i > 0? (
                          <span onClick={() => onDelete(i)} className="table-option color-danger">
                            <em className="fa-regular fa-trash-can"></em>
                          </span>
                        ): (<></>)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ): [2, 3].indexOf(mapLayer.type) > -1? (
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ minWidth: 100 }}>แกนข้อมูล</th>
                    <th style={{ minWidth: 180 }}>
                      คีย์ข้อมูล <span className="color-danger">*</span>
                    </th>
                    <th style={{ minWidth: 180, width: '100%' }}>
                      ชื่อข้อมูล <span className="color-danger">*</span>
                    </th>
                    <th style={{ minWidth: 140 }}>หน่วย</th>
                    <th style={{ minWidth: 140 }}>ประเภท</th>
                    <th style={{ minWidth: 120 }}>
                      ทศนิยม <span className="color-danger">*</span>
                    </th>
                    <th style={{ minWidth: 120 }}>
                      สี <span className="color-danger">*</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attributes.map((d, i) => (
                    <tr key={`attr_${i}`}>
                      <td className="text-center">
                        {d.axis === 1? 'X': 'Y'}
                      </td>
                      <td>
                        <div className="form-control">
                          <input
                            type="text" required={true} value={d.key? d.key: ''} 
                            onChange={e => onChange(i, 'key', e.target.value)} 
                          />
                        </div>
                      </td>
                      <td>
                        <div className="form-control">
                          <input
                            type="text" required={true} value={d.name? d.name: ''} 
                            onChange={e => onChange(i, 'name', e.target.value)} 
                          />
                        </div>
                      </td>
                      <td>
                        <div className="form-control">
                          <input
                            type="text" value={d.unit? d.unit: ''} 
                            onChange={e => onChange(i, 'unit', e.target.value)} 
                          />
                        </div>
                      </td>
                      <td>
                        <div className="form-control">
                          <select 
                            disabled={(mapLayer.type === 2 && i === 1) || (mapLayer.type === 3 && i === 0)} 
                            value={d.dataType? d.dataType: 0} 
                            onChange={e => onChange(i, 'dataType', Number(e.target.value))} 
                          >
                            <option value={1}>Text</option>
                            <option value={2}>Number</option>
                          </select>
                        </div>
                      </td>
                      <td>
                        {d.dataType === 2? (
                          <div className="form-control">
                            <input
                              type="number" min={0} step={1} required={true} 
                              value={d.digits || d.digits===0? d.digits: ''} 
                              onChange={e => onChange(i, 'digits',
                                e.target.value || e.target.value===0? Number(e.target.value): ''
                              )} 
                            />
                          </div>
                        ): (<></>)}
                      </td>
                      <td>
                        {(mapLayer.type === 2 && i === 1) || (mapLayer.type === 3 && i === 0)? (
                          <div className="form-control">
                            <input 
                              type="color" required={true} value={d.color? d.color: ''} 
                              onChange={e => onChange(i, 'color', e.target.value)} 
                            />
                          </div>
                        ): (<></>)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ): [4, 5].indexOf(mapLayer.type) > -1? (
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ minWidth: 180 }}>
                      คีย์ข้อมูล <span className="color-danger">*</span>
                    </th>
                    <th style={{ minWidth: 180, width: '100%' }}>
                      ชื่อข้อมูล <span className="color-danger">*</span>
                    </th>
                    <th style={{ minWidth: 140 }}>หน่วย</th>
                    <th style={{ minWidth: 140 }}>ประเภท</th>
                    <th style={{ minWidth: 120 }}>
                      ทศนิยม <span className="color-danger">*</span>
                    </th>
                    <th style={{ minWidth: 120 }}>
                      สี <span className="color-danger">*</span>
                    </th>
                    <th style={{ minWidth: 100 }} className="text-center">
                      <div onClick={onAdd} className="btn btn-action btn-p btn-xxs ml-2">
                        <em className="fa-solid fa-plus mr-1"></em> เพิ่ม
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attributes.map((d, i) => (
                    <tr key={`attr_${i}`}>
                      <td>
                        <div className="form-control">
                          <input
                            type="text" required={true} value={d.key? d.key: ''} 
                            onChange={e => onChange(i, 'key', e.target.value)} 
                          />
                        </div>
                      </td>
                      <td>
                        <div className="form-control">
                          <input
                            type="text" required={true} value={d.name? d.name: ''} 
                            onChange={e => onChange(i, 'name', e.target.value)} 
                          />
                        </div>
                      </td>
                      <td>
                        <div className="form-control">
                          <input
                            type="text" value={d.unit? d.unit: ''} 
                            onChange={e => onChange(i, 'unit', e.target.value)} 
                          />
                        </div>
                      </td>
                      <td>
                        <div className="form-control">
                          <select 
                            disabled={true} 
                            value={d.dataType? d.dataType: 0} 
                            onChange={e => onChange(i, 'dataType', Number(e.target.value))} 
                          >
                            <option value={1}>Text</option>
                            <option value={2}>Number</option>
                          </select>
                        </div>
                      </td>
                      <td>
                        {d.dataType === 2? (
                          <div className="form-control">
                            <input
                              type="number" min={0} step={1} required={true} 
                              value={d.digits || d.digits===0? d.digits: ''} 
                              onChange={e => onChange(i, 'digits',
                                e.target.value || e.target.value===0? Number(e.target.value): ''
                              )} 
                            />
                          </div>
                        ): (<></>)}
                      </td>
                      <td>
                        <div className="form-control">
                          <input 
                            type="color" required={true} value={d.color? d.color: ''} 
                            onChange={e => onChange(i, 'color', e.target.value)} 
                          />
                        </div>
                      </td>
                      <td className="text-center">
                        {i > 0? (
                          <span onClick={() => onDelete(i)} className="table-option color-danger">
                            <em className="fa-regular fa-trash-can"></em>
                          </span>
                        ): (<></>)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ): [6].indexOf(mapLayer.type) > -1? (
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ minWidth: 180 }}>
                      คีย์ข้อมูล <span className="color-danger">*</span>
                    </th>
                    <th style={{ minWidth: 180, width: '100%' }}>
                      ชื่อข้อมูล <span className="color-danger">*</span>
                    </th>
                    <th style={{ minWidth: 140 }}>หน่วย</th>
                    <th style={{ minWidth: 140 }}>ประเภท</th>
                    <th style={{ minWidth: 120 }}>
                      ทศนิยม <span className="color-danger">*</span>
                    </th>
                    <th style={{ minWidth: 120 }}>
                      สี <span className="color-danger">*</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attributes.map((d, i) => (
                    <tr key={`attr_${i}`}>
                      <td>
                        <div className="form-control">
                          <input
                            type="text" required={true} value={d.key? d.key: ''} 
                            onChange={e => onChange(i, 'key', e.target.value)} 
                          />
                        </div>
                      </td>
                      <td>
                        <div className="form-control">
                          <input
                            type="text" required={true} value={d.name? d.name: ''} 
                            onChange={e => onChange(i, 'name', e.target.value)} 
                          />
                        </div>
                      </td>
                      <td>
                        <div className="form-control">
                          <input
                            type="text" value={d.unit? d.unit: ''} 
                            onChange={e => onChange(i, 'unit', e.target.value)} 
                          />
                        </div>
                      </td>
                      <td>
                        <div className="form-control">
                          <select 
                            disabled={true} 
                            value={d.dataType? d.dataType: 0} 
                            onChange={e => onChange(i, 'dataType', Number(e.target.value))} 
                          >
                            <option value={1}>Text</option>
                            <option value={2}>Number</option>
                          </select>
                        </div>
                      </td>
                      <td>
                        {d.dataType === 2? (
                          <div className="form-control">
                            <input
                              type="number" min={0} step={1} required={true} 
                              value={d.digits || d.digits===0? d.digits: ''} 
                              onChange={e => onChange(i, 'digits',
                                e.target.value || e.target.value===0? Number(e.target.value): ''
                              )} 
                            />
                          </div>
                        ): (<></>)}
                      </td>
                      <td>
                        <div className="form-control">
                          <input 
                            type="color" required={true} value={d.color? d.color: ''} 
                            onChange={e => onChange(i, 'color', e.target.value)} 
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ): (<></>)}
          </div>
        </div>
        <div className="app-card-block border-top-1 bcolor-fgray pt-0">
          <div className="btns">
            <button type="submit" className="btn btn-action btn-p">
              บันทึกข้อมูล
            </button>
          </div>
        </div>
      </div>
    </form>
  ): (<></>);
}

MapLayerAttributes.defaultProps = {
  mapLayer: PropTypes.object.isRequired,
};
MapLayerAttributes.propTypes = {
  processUpdate: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  list: state.app.mapLayers,
});

export default connect(mapStateToProps, {
  processUpdate: processUpdate,
})(MapLayerAttributes);