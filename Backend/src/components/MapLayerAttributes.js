import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import { connect } from 'react-redux';
import { processUpdate } from '../actions/admin.actions';
import { MapLayerModel } from '../models';

function MapLayerAttributes(props) {
  const mapLayer = new MapLayerModel(props.mapLayer);

  const [attributes, setAttributes] = useState([]);
  const onAdd = () => {
    let temp = [ ...attributes ];
    temp.push({ name: '', unit: '', key: '' });
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
        setAttributes([{ name: '', unit: '', key: '' }]);
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
            <table className="table">
              <thead>
                <tr>
                  <th style={{ minWidth: 120, width: '33%' }}>
                    ชื่อคุณลักษณะ <span className="color-danger">*</span>
                  </th>
                  <th style={{ minWidth: 120, width: '33%' }}>หน่วย</th>
                  <th style={{ minWidth: 120, width: '33%' }}>
                    คีย์ข้อมูล <span className="color-danger">*</span>
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
                          type="text" required={true} 
                          value={d.name? d.name: ''} 
                          onChange={e => onChange(i, 'name', e.target.value)} 
                        />
                      </div>
                    </td>
                    <td>
                      <div className="form-control">
                        <input
                          type="text" 
                          value={d.unit? d.unit: ''} 
                          onChange={e => onChange(i, 'unit', e.target.value)} 
                        />
                      </div>
                    </td>
                    <td>
                      <div className="form-control">
                        <input
                          type="text" required={true} 
                          value={d.key? d.key: ''} 
                          onChange={e => onChange(i, 'key', e.target.value)} 
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