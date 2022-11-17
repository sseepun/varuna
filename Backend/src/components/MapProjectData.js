import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import { connect } from 'react-redux';
import {
  processClear, processList, processCreate, processRead, processUpdate, processDelete
} from '../actions/admin.actions';
import { userFileUpload } from '../actions/user.actions';
import { MapProjectModel, MapDataModel } from '../models';


function MapProjectData(props) {
  const [randomKey, setRandomKey] = useState(Math.random().toString(36));
  const mapProject = new MapProjectModel(props.mapProject);
  
  const [selectedData, setSelectedData] = useState(new MapDataModel({ status: 1 }));
  const onChangeInput = (key, val, isNumber=false) => {
    if(isNumber) val = val || val===0? Number(val): '';
    setSelectedData(new MapDataModel({ ...selectedData, [key]: val }));
  };
  const onChangeFile = async (e) => {
    e.preventDefault();
    let res = await props.processFileUpload(e.target.files[0], false, 'geojson');
    if(res) onChangeInput('data', res);
  };

  const [data, setData] = useState(null);
  const [process, setProcess] = useState('');
  const onProcess = async (e, p='', d=null) => {
    if(e) e.preventDefault();
    setData(null);
    if(p){
      if(p === 'read'){
        let res = await props.processRead('map-data', { _id: d._id }, true);
        if(res){
          setSelectedData(res);
          let temp = await res.getData();
          setData(temp);
        }
      }else{
        if(d) setSelectedData(new MapDataModel(d));
        else setSelectedData(new MapDataModel({ status: 1 }));
      }
    }else{
      setSelectedData(new MapDataModel({ status: 1 }));
    }
    setProcess(p);
    setRandomKey(Math.random().toString(36));
  };

  const onSubmit = async (e) => {
    if(e) e.preventDefault();
    if(process === 'create'){
      let res = await props.processCreate('map-data', {
        ...selectedData, mapProjectId: mapProject._id,
      }, true);
      if(res){
        props.processList('map-datas', { dataFilter: { mapProjectId: mapProject._id } });
        let data = await props.processRead('map-data', { _id: res.data }, true);
        if(data.isValid()){
          setProcess('read');
          setSelectedData(new MapDataModel(data));
        }else{
          setProcess('');
          setSelectedData(new MapDataModel({ status: 1 }));
        }
      }
    }else if(process === 'update'){
      let res = await props.processUpdate('map-data', selectedData, true);
      if(res){
        props.processList('map-datas', { dataFilter: { mapProjectId: mapProject._id } });
      }
    }else if(process === 'delete'){
      let res = await props.processDelete('map-data', { _id: selectedData._id }, true);
      if(res){
        props.processList('map-datas', { dataFilter: { mapProjectId: mapProject._id } });
        setProcess('');
        setSelectedData(new MapDataModel({ status: 1 }));
      }
    }
  };

  /* eslint-disable */
	useEffect(() => {
    if(mapProject.isValid()){
      props.processList('map-layers', { dataFilter: { status: 1 } });
      props.processList('map-datas', { dataFilter: { mapProjectId: mapProject._id } });
    }
  }, []);
  /* eslint-enable */

  return mapProject.isValid()? (
    <>
      <div className="app-card pt-0 mt-4">
        <div className="grids">
          {props.list.map((d, i) => (
            <div className="grid lg-1-3 sm-50" key={`card_${i}`}>
              <div className="ss-card ss-card-03 bradius">
                <div className="wrapper">
                  <div className="title h-color-p" onClick={e => onProcess(e, 'read', d)}>
                    <span className="fw-500">ชื่อข้อมูล :</span> {d.name}
                  </div>
                  <p className="sm mt-1">
                    <span className="fw-500">ช่วงเวลา :</span> 01/2565 - 12/2565
                  </p>
                  <div className="options">
                    {d.displayStatus()}
                    <div className="d-flex ai-center">
                      <span 
                        className="table-option color-info c-pointer mr-2" 
                        onClick={e => onProcess(e, 'read', d)} 
                      >
                        <em className="fa-regular fa-eye"></em>
                      </span>
                      <span 
                        className="table-option color-success c-pointer mr-2" 
                        onClick={e => onProcess(e, 'update', d)} 
                      >
                        <em className="fa-regular fa-pen-to-square"></em>
                      </span>
                      <span 
                        className="table-option color-danger c-pointer" 
                        onClick={e => onProcess(e, 'delete', d)} 
                      >
                        <em className="fa-regular fa-trash-can"></em>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="grid lg-1-3 sm-50">
            <div 
              className="ss-card ss-card-02 bradius c-pointer" 
              onClick={e => onProcess(e, 'create')} 
            >
              <div className="wrapper">
                <div className="icon">
                  <em className="fa-solid fa-plus"></em>
                </div>
                <p className="fw-500">เพิ่มข้อมูลแผนที่</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`popup-container ${['create', 'update'].indexOf(process) > -1? 'active': ''}`}>
        <div className="wrapper">
          <div className="popup-box popup-lg">
            <div className="popup-header">
              <h6 className="fw-600 lh-xs">
                {process === 'create'? 'เพิ่ม': 'แก้ไข'}ข้อมูลแผนที่
              </h6>
              <div className="btn-close" onClick={onProcess}>
                <div className="hamburger active">
                  <div></div><div></div><div></div>
                </div>
              </div>
            </div>
            <form onSubmit={onSubmit}>
              <div className="popup-body pt-0">
                <div className="grids">
                  <div className="grid sm-50">
                    <div className="form-control">
                      <label>ชื่อข้อมูล <span className="color-danger">*</span></label>
                      <input
                        type="text" required={true} 
                        value={selectedData && selectedData.name? selectedData.name: ''} 
                        onChange={e => onChangeInput('name', e.target.value)} 
                      />
                    </div>
                  </div>
                  <div className="grid sm-50">
                    <div className="form-control">
                      <label>สถานะ <span className="color-danger">*</span></label>
                      <select 
                        required={true} 
                        value={selectedData && (selectedData.status || selectedData.status===0)? selectedData.status: ''} 
                        onChange={e => onChangeInput('status', e.target.value, true)} 
                      >
                        <option value="1">เปิดใช้งาน</option>
                        <option value="0">ปิดใช้งาน</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid sm-100">
                    <div className="form-control">
                      <label>
                        ไฟล์ GeoJSON
                        {process === 'create'? (<span className="color-danger">*</span>): (<></>)}
                      </label>
                      <input 
                        key={`file_${randomKey}`} 
                        type="file" accept=".geojson" 
                        required={process === 'create'} 
                        onChange={onChangeFile} 
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="popup-footer">
                <div className="btns mt-0">
                  <button type="submit" className="btn btn-action btn-p">
                    {process === 'create'? 'เพิ่ม': 'แก้ไข'}
                  </button>
                  {process === 'update'? (
                    <button 
                      type="button" className="btn btn-action btn-p-border" 
                      onClick={e => onProcess(e, 'read', selectedData)} 
                    >
                      ดูข้อมูล
                    </button>
                  ): (<></>)}
                  <button type="button" className="btn btn-action btn-default" onClick={onProcess}>
                    ปิด
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className={`popup-container ${process === 'delete'? 'active': ''}`}>
        <div className="wrapper">
          <div className="popup-box">
            <div className="popup-header">
              <h6 className="fw-600 lh-xs">ยืนยันการลบข้อมูล</h6>
              <div className="btn-close" onClick={onProcess}>
                <div className="hamburger active">
                  <div></div><div></div><div></div>
                </div>
              </div>
            </div>
            <form onSubmit={onSubmit}>
              <div className="popup-body">
                <p className="fw-500">
                  กรุณายืนยันการลบข้อมูล ข้อมูลไม่สามารถนำกลับมาได้หลังจากถูกลบไปแล้ว
                </p>
              </div>
              <div className="popup-footer">
                <div className="btns mt-0">
                  <button type="submit" className="btn btn-action btn-p">
                    ยืนยันการลบ
                  </button>
                  <button type="button" className="btn btn-action btn-default" onClick={onProcess}>
                    ปิด
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className={`popup-container ${process === 'read'? 'active': ''}`}>
        <div className="wrapper">
          <div className="popup-box popup-xxl">
            <div className="popup-header">
              <h6 className="fw-600 lh-xs">
                ดูข้อมูลแผนที่ : {selectedData.name} 
                <span className="ml-4">{selectedData.displayStatus()}</span>
              </h6>
              <div className="btn-close" onClick={onProcess}>
                <div className="hamburger active">
                  <div></div><div></div><div></div>
                </div>
              </div>
            </div>
            <div className="popup-body">
              {`${data}`}
            </div>
            <div className="popup-footer">
              <div className="btns mt-0">
                <button type="button" className="btn btn-action btn-default" onClick={onProcess}>
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  ): (<></>);
}

MapProjectData.defaultProps = {
  
};
MapProjectData.propTypes = {
  processClear: PropTypes.func.isRequired,
  processList: PropTypes.func.isRequired,
  processCreate: PropTypes.func.isRequired,
  processRead: PropTypes.func.isRequired,
  processUpdate: PropTypes.func.isRequired,
  processDelete: PropTypes.func.isRequired,
  processFileUpload: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  list: state.app.mapDatas,
  layers: state.app.mapLayers,
});

export default connect(mapStateToProps, {
  processClear: processClear,
  processList: processList,
  processCreate: processCreate,
  processRead: processRead,
  processUpdate: processUpdate,
  processDelete: processDelete,
  processFileUpload: userFileUpload,
})(MapProjectData);