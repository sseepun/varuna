import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import axios from 'axios';
import { apiHeaderFormData } from '../helpers/header';
import { formatNumber } from '../helpers/frontend';

import * as turf from '@turf/turf';
import Map, { Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import { connect } from 'react-redux';
import {
  processClear, processList, processCreate, processRead, processUpdate, processDelete
} from '../actions/admin.actions';
import { MapProjectModel, MapDataModel, MapLayerModel } from '../models';
import { CDN_URL, MAPBOX_KEY } from '../actions/variables';


function MapProjectData(props) {
  const [randomKey, setRandomKey] = useState(Math.random().toString(36));
  const mapProject = new MapProjectModel(props.mapProject);
  
  const [selectedData, setSelectedData] = useState(new MapDataModel({ status: 1 }));
  const onChangeInput = (key, val, isNumber=false) => {
    if(isNumber) val = val || val===0? Number(val): '';
    setSelectedData(new MapDataModel({ ...selectedData, [key]: val }));
  };

  const [uploadStatus, setUploadStatus] = useState(0);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [uploadMessage, setUploadMessage] = useState('');
  const onChangeFile = async (e) => {
    e.preventDefault();
    if(uploadStatus === 0){
      setUploadStatus(1);
      setUploadPercent(0);
      let formData = new FormData();
      formData.append('file', e.target.files[0]);
      axios.request({
        method: 'post', 
        url: `${CDN_URL}file/single/geojson`,
        headers: apiHeaderFormData(),
        data: formData, 
        onUploadProgress: (p) => {
          setUploadPercent(p.progress? p.progress: 0);
        }
      }).then(res => {
        setUploadStatus(2);
        setUploadPercent(1);
        setUploadMessage('Upload GeoJSON successfully.');
        onChangeInput('data', res.data.data.file);
      }).catch(function (err) {
        setUploadStatus(-1);
        if(err.response){
          setUploadMessage(`Failed to upload with status code ${err.response.status}.`);
        }else if(err.request){
          setUploadMessage(`Failed to upload with reason : ${err.request}.`);
        }else{
          setUploadMessage(`Failed to upload with reason : ${err.message}.`);
        }
      });
    }
  };

  const [mapData, setMapData] = useState(null);
  const [mapCenter, setMapCenter] = useState([100.5018, 13.7563]);
  const [mapStyle, setMapStyle] = useState('satellite-v9');
  
  const [process, setProcess] = useState('');
  const onProcess = async (e, p='', d=null) => {
    if(e) e.preventDefault();
    setMapData(null);
    setDisplayData(null);
    if(p){
      if(p === 'read'){
        let res = await props.processRead('map-data', { _id: d._id }, true);
        if(res){
          setSelectedData(res);
          let temp = await res.getData();
          let center = turf.center(temp);
          setMapData(temp);
          setDisplayData(temp);
          setMapCenter(center.geometry.coordinates);
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
          onProcess(null, 'read', data);
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


  // START: Map Layer
  const [selectedLayer, setSelectedLayer] = useState(new MapLayerModel({}));
  const onChangeLayer = (val) => {
    setDisplayData(mapData);
    setSelectedRow(-1);
    let temp = [ ...props.layers ].filter(d => d._id === val);
    if(temp.length) setSelectedLayer(temp[0]);
    else setSelectedLayer(new MapLayerModel({}));
  };

  const [selectedRow, setSelectedRow] = useState(-1);
  const [displayData, setDisplayData] = useState(null);
  const onFilterMapData = (e=null, i=-1, feature=null) => {
    if(e) e.preventDefault();
    if(!feature){
      selectedRow(-1);
      setDisplayData(mapData);
    }else{
      if(i === selectedRow){
        setSelectedRow(-1);
        setDisplayData(mapData);
        let center = turf.center(mapData);
        setMapCenter(center.geometry.coordinates);
      }else{
        setSelectedRow(i);
        let temp = { ...mapData };
        temp.features = [ feature ];
        setDisplayData(temp);
        let center = turf.center(temp);
        setMapCenter(center.geometry.coordinates);
      }
    }
  };
  // END: Map Layer


  /* eslint-disable */
	useEffect(() => {
    if(mapProject.isValid()){
      props.processList('map-datas', { dataFilter: { mapProjectId: mapProject._id } });
      props.processList('map-layers', { dataFilter: { status: 1 } }).then(d => {
        if(d && d.result && d.result.length) setSelectedLayer(d.result[0]);
      });
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
                <p className="fw-500">สร้างข้อมูลแผนที่</p>
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
                {process === 'create'? 'สร้าง': 'แก้ไข'}ข้อมูลแผนที่
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
                        ไฟล์ GeoJSON{' '}
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
                    {process === 'create'? 'สร้าง': 'แก้ไข'}
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
                    ยกเลิก
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
                  กรุณายืนยันการลบข้อของคุณ ข้อมูลไม่สามารถนำกลับมาได้หลังจากถูกลบไปแล้ว
                </p>
              </div>
              <div className="popup-footer">
                <div className="btns mt-0">
                  <button type="submit" className="btn btn-action btn-danger">
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
          <div className="popup-box popup-3xl">
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
            <div className="popup-body pt-0">
              <div className="grids">
                <div className="grid md-60 sm-100">
                  {mapData? (
                    <Map 
                      initialViewState={{
                        longitude: mapCenter[0],
                        latitude: mapCenter[1],
                        zoom: 11.75,
                      }} 
                      style={{ width: '100%', height: '28rem' }} 
                      mapStyle={`mapbox://styles/mapbox/${mapStyle}`} 
                      mapboxAccessToken={MAPBOX_KEY} 
                      interactiveLayerIds={[ 'data' ]} 
                    >
                      <Source type="geojson" data={displayData}>
                        {selectedLayer.isValid()? (
                          <Layer 
                            {...{
                              id: 'data',
                              type: 'fill',
                              paint: {
                                'fill-color': selectedLayer.color,
                                'fill-opacity': selectedLayer.opacity/100,
                              }
                            }}
                          />
                        ): (<></>)}
                      </Source>
                    </Map>
                  ): (<></>)}
                </div>
                <div className="grid md-40 sm-100">
                  <div className="grids">
                    <div className="grid sm-100 mt-0">
                      <div className="form-control">
                        <label>รูปแบบแผนที่</label>
                        <select 
                          value={mapStyle? mapStyle: ''} 
                          onChange={e => setMapStyle(e.target.value)} 
                        >
                          <option value="satellite-v9">Satellite</option>
                          <option value="light-v10">Light</option>
                          <option value="dark-v10">Dark</option>
                          <option value="streets-v11">Streets</option>
                          <option value="outdoors-v11">Outdoors</option>
                        </select>
                      </div>
                    </div>
                    {props.layers.length? (
                      <div className="grid sm-100">
                        <div className="form-group">
                          <label>เลเยอร์แผนที่</label>
                          <select 
                            value={selectedLayer && selectedLayer._id? selectedLayer._id: ''} 
                            onChange={e => onChangeLayer(e.target.value)} 
                          >
                            {props.layers.map((d, i) => (
                              <option key={`layer_${i}`} value={d._id}>{d.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ): (<></>)}

                    {displayData && selectedLayer.isValid()? (
                      <div className="grid sm-100">

                        {selectedLayer.type === 1? ( // Table
                          <div className="graph-wrapper border-bottom-1 bcolor-fgray">
                            <table className="table header-sticky">
                              <thead>
                                <tr>
                                  <th style={{ width: '3rem' }} className="text-center">ID</th>
                                  {selectedLayer.attributes.map((d, i) => (
                                    <th key={`th_${i}`} className="ws-nowrap">{d.name}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {!mapData.features || !mapData.features.length? (
                                  <tr>
                                    <td 
                                      colSpan={selectedLayer.attributes.length+1} 
                                      className="text-center" 
                                    >
                                      ไม่มีข้อมูล
                                    </td>
                                  </tr>
                                ): (
                                  mapData.features.map((d, i) => (
                                    <tr 
                                      key={`row_${i}`} className={`c-pointer ${i === selectedRow? 'row-active': ''}`} 
                                      onClick={e => onFilterMapData(e, i, d)} 
                                    >
                                      <td className="text-center">{i+1}</td>
                                      {selectedLayer.attributes.map((k, j) => (
                                        <td key={`col_${i}_${j}`} className="ws-nowrap">
                                          {isNaN(d.properties[k.key])
                                            ? d.properties[k.key]
                                            : formatNumber(d.properties[k.key])} {k.unit}
                                        </td>
                                      ))}
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        ): (<></>)}

                      </div>
                    ): (<></>)}

                  </div>
                </div>
              </div>
            </div>
            <div className="popup-footer">
              <div className="btns mt-0">
                <button type="button" className="btn btn-action btn-default" onClick={onProcess}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GeoJSON Uploader */}
      <div className={`popup-container ${uploadStatus > 0? 'active': ''}`}>
        <div className="wrapper">
          <div className="popup-box">
            <div className="popup-header">
              <h6 className="fw-600 lh-xs">
                {uploadStatus === 1
                  ? 'Uploading GeoJSON': 'Upload GeoJSON successfully'}
              </h6>
            </div>
            <div className="popup-body">
              <div className="progress-container">
                <div className="progress-wrapper">
                  <div className="progress-bar">
                    <div className="bar" style={{ width: `${uploadPercent*100}%` }}></div>
                  </div>
                </div>
                <div className="percent-text">
                  {Math.round(uploadPercent*100)}%
                </div>
              </div>
            </div>
            <div className="popup-footer">
              <div className="btns mt-0">
                <button 
                  type="button" onClick={e => { e.preventDefault(); setUploadStatus(0); }}
                  className={`btn btn-action btn-disabled ${uploadStatus < 2? 'op-50 pe-none': ''}`} 
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={`popup-container ${uploadStatus < 0? 'active': ''}`}>
        <div className="wrapper">
          <div className="popup-box">
            <div className="popup-header">
              <h6 className="fw-600 lh-xs">
                Failed to upload GeoJSON
              </h6>
            </div>
            <div className="popup-body">
              <p className="fw-500">
                {uploadMessage}
              </p>
            </div>
            <div className="popup-footer">
              <div className="btns mt-0">
                <button 
                  type="button" onClick={e => { e.preventDefault(); setUploadStatus(0); }}
                  className={`btn btn-action btn-disabled`} 
                >
                  Close
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
  mapProject: PropTypes.object.isRequired,
};
MapProjectData.propTypes = {
  processClear: PropTypes.func.isRequired,
  processList: PropTypes.func.isRequired,
  processCreate: PropTypes.func.isRequired,
  processRead: PropTypes.func.isRequired,
  processUpdate: PropTypes.func.isRequired,
  processDelete: PropTypes.func.isRequired,
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
})(MapProjectData);