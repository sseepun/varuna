import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { onMounted } from '../../helpers/frontend';
import Breadcrumb from '../../components/Breadcrumb';
import Footer from '../../components/Footer';
import ImageUploader from '../../components/ImageUploader';

import { connect } from 'react-redux';
import { setSidenavActiveIndex } from '../../actions/app.actions';
import { processCreate, processRead, processUpdate } from '../../actions/admin.actions';
import { MapLayerModel } from '../../models';


function MapLayerPage(props) {
  const history = useNavigate();
  const params = useParams();
  const process = params.process? params.process: 'create';
  const dataId = params['*']? params['*']: null;

  const [values, setValues] = useState(new MapLayerModel({ status: 1 }));
  const onChangeInput = (key, val, isNumber=false) => {
    if(isNumber) val = val || val===0? Number(val): '';
    setValues({ ...values, [key]: val });
  };
  const onChangeFile = (key) => (val) => {
    onChangeInput(key, val);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if(process === 'create'){
      let res = await props.processCreate('map-layer', values, true);
      if(res) history(`/admin/map-layers`);
    }else if(process === 'update'){
      let updateInput = { ...values };
      await props.processUpdate('map-layer', updateInput, true);
    }
  };

  /* eslint-disable */
	useEffect(() => { onMounted(); props.setSidenavActiveIndex(21); }, []);
	useEffect(() => {
    if(['create', 'view', 'update'].indexOf(process) < 0){
      history('/admin/map-layers');
    }else{
      if(['view', 'update'].indexOf(process) > -1){
        props.processRead('map-layer', { _id: dataId }, true).then(d => {
          setValues(d);
        }).catch(() => history('/admin/map-layers'));
      }
    }
  }, []);
  /* eslint-enable */

  return (
    <div className="app-container">
      <Breadcrumb 
        title={`${process==='create'? 'สร้าง': 'แก้ไข'}เลเยอร์แผนที่`} 
        structure={[
          { title: 'การจัดการข้อมูลแผนที่', to: '/admin' },
          { title: 'เลเยอร์แผนที่', to: '/admin/map-layers' }
        ]}
      />

      <div className="app-card p-0 mt-4">
        <form onSubmit={onSubmit}>
          <div className="app-card-block pt-0">
            <div className="grids">
              <div className="grid sm-100 lg-80 xl-2-3">
                <div className="form-control">
                  <label>ชื่อเลเยอร์ <span className="color-danger">*</span></label>
                  <input
                    type="text" disabled={process==='view'} required={true} 
                    value={values.name? values.name: ''} 
                    onChange={e => onChangeInput('name', e.target.value)} 
                  />
                </div>
              </div>
              <div className="sep"></div>
              <div className="grid sm-100 md-100 lg-80 xl-2-3">
                <div className="form-control">
                  <label>คำบรรยาย</label>
                  <textarea
                    type="text" disabled={process==='view'} rows={2} 
                    value={values.description? values.description: ''} 
                    onChange={e => onChangeInput('description', e.target.value)} 
                  ></textarea>
                </div>
              </div>
              <div className="sep"></div>
              <div className="grid sm-50 md-50 lg-40 xl-1-3">
                <div className="form-control">
                  <label>รูปภาพ</label>
                  <ImageUploader
                    process={process} images={[values.image]} 
                    onChangeImage={onChangeFile('image')} isMultiple={false} 
                  />
                </div>
              </div>
              <div className="grid sm-50 md-50 lg-40 xl-1-3">
                <div className="form-control">
                  <label>ไอคอน</label>
                  <ImageUploader
                    process={process} images={[values.icon]} 
                    onChangeImage={onChangeFile('icon')} isMultiple={false} 
                  />
                </div>
              </div>
              <div className="sep"></div>
              <div className="grid sm-50 md-50 lg-40 xl-1-3">
                <div className="form-control">
                  <label>สถานะ <span className="color-danger">*</span></label>
                  <select 
                    disabled={!values.isDeletable || process==='view'} required={true} 
                    value={values.status || values.status===0? values.status: ''} 
                    onChange={e => onChangeInput('status', e.target.value, true)} 
                  >
                    <option value="1">เปิดใช้งาน</option>
                    <option value="0">ปิดใช้งาน</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="app-card-block border-top-1 bcolor-fgray pt-0">
            <div className="btns">
              {['create', 'update'].indexOf(process) > -1? (
                <button type="submit" className="btn btn-action btn-p">
                  {process==='create'? 'สร้าง': 'แก้ไข'}ข้อมูล
                </button>
              ): (<></>)}
              {process === 'update'? (
                <Link to={`/admin/map-layer/view/${dataId}`} className="btn btn-action btn-p-border">
                  ดูข้อมูล
                </Link>
              ): (<></>)}
              <Link to="/admin/map-layers" className="btn btn-action btn-default">
                ย้อนกลับ
              </Link>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}

MapLayerPage.defaultProps = {
	
};
MapLayerPage.propTypes = {
  processCreate: PropTypes.func.isRequired,
	processRead: PropTypes.func.isRequired,
	processUpdate: PropTypes.func.isRequired
};

const mapStateToProps = (state) => ({
	
});

export default connect(mapStateToProps, {
  setSidenavActiveIndex: setSidenavActiveIndex,
  processCreate: processCreate,
  processRead: processRead,
  processUpdate: processUpdate
})(MapLayerPage);