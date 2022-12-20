import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { onMounted } from '../../helpers/frontend';
import Breadcrumb from '../../components/Breadcrumb';
import Footer from '../../components/Footer';

import MapLayerAttributes from '../../components/MapLayerAttributes';

import { connect } from 'react-redux';
import { setSidenavActiveIndex } from '../../actions/app.actions';
import { processRead } from '../../actions/admin.actions';
import { MapLayerModel } from '../../models';


function MapLayerViewPage(props) {
  const history = useNavigate();
  const params = useParams();
  // const process = params.process? params.process: 'view';
  const dataId = params.dataId? params.dataId: null;

  const [values, setValues] = useState(new MapLayerModel({ status: 1 }));
  
  const [tabIndex, setTabIndex] = useState(0);
  const tabList = ['ข้อมูลเลเยอร์', 'คุณลักษณะเลเยอร์'];
  const onChangeTabIndex = (e, i) => {
    e.preventDefault();
    setTabIndex(i);
  };

  /* eslint-disable */
	useEffect(() => { onMounted(); props.setSidenavActiveIndex(21); }, []);
	useEffect(() => {
    props.processRead('map-layer', { _id: dataId }, true).then(d => {
      setValues(d);
    }).catch(() => history('/admin/map-layers'));
  }, []);
  /* eslint-enable */

  return (
    <div className="app-container">
      <Breadcrumb 
        title={`ดูเลเยอร์แผนที่`} 
        structure={[
          { title: 'การจัดการข้อมูลแผนที่', to: '/admin' },
          { title: 'เลเยอร์แผนที่', to: '/admin/map-layers' }
        ]}
      />
      
      <div className="app-card mt-4">
        <div className="grids">
          <div className="avatar-profile">
            <div className="avatar-img">
              <div className="avatar xxl bradius">
                <div className="avatar-bg" 
                  style={{
                    backgroundImage: `url('${values.image.path
                      ? values.image.path: '/assets/img/default/img.jpg'}')`
                  }} 
                ></div>
              </div>
            </div>
            {values.isValid()? (
              <div className="avatar-desc">
                <h5 className="fw-500">{values.name}</h5>
                <p className="fw-500 color-gray">
                  สถานะ : <span className="fw-700 color-p">{values.displayStatus()}</span> 
                </p>
                <div className="btns mt-2">
                  <Link to={`/admin/map-layer/update/${dataId}`} className="btn btn-action btn-p btn-xs">
                    <em className="fa-regular fa-pen-to-square mr-1"></em> แก้ไขข้อมูล
                  </Link>
                  <Link to="/admin/map-layers" className="btn btn-action btn-default btn-xs">
                    ย้อนกลับ
                  </Link>
                </div>
              </div>
            ): (<></>)}
          </div>
        </div>
      </div>
      <div className="app-card tabs-02 break-md p-0 mt-4">
        {tabList.map((d, i) => (
          <div 
            key={`tab_${i}`} onClick={e => onChangeTabIndex(e, i)} 
            className={`tab ${tabIndex===i? 'active': ''}`} 
          >
            <p className="lg fw-600 text-center">{d}</p>
          </div>
        ))}
      </div>
      
      {tabIndex === 0? (
        <>
          <div className="app-card p-0 mt-4">
            <div className="app-card-block">
              <p className="lg fw-800">ข้อมูลเลเยอร์</p>
              <div className="ss-sep-01 mt-3"></div>
              <div className="grids">
                <div className="grid lg-40 md-50 sm-100">
                  <span className="fw-700">ชื่อเลเยอร์ :</span> {values.name}
                </div>
                <div className="grid lg-40 md-50 sm-100">
                  <span className="fw-700">สถานะ :</span> {values.displayStatus()}
                </div>
                <div className="sep"></div>
                <div className="grid lg-80 md-100 sm-100">
                  <span className="fw-700">คำบรรยาย :</span> {values.description? values.description: '-'}
                </div>
                <div className="sep"></div>
                <div className="grid lg-40 md-50 sm-100">
                  <div className="d-flex ai-center">
                    <span className="fw-700">สี :</span>
                    <span 
                      className="color-block ml-2" 
                      style={{ background: values.color, opacity: values.opacity/100 }} 
                    ></span>
                  </div>
                </div>
                <div className="grid lg-40 md-50 sm-100">
                  <span className="fw-700">การแสดงผล :</span> {values.displayType()}
                </div>
              </div>
            </div>
          </div>
          {values.icon.path || values.image.path? (
            <div className="app-card p-0 mt-4">
              <div className="app-card-block">
                <p className="lg fw-800">ข้อมูลรูปภาพ</p>
                <div className="ss-sep-01 mt-3"></div>
                <div className="gallery-grids pt-3">
                  {values.icon.path? (
                    <div className="grid xl-15 lg-20 md-25 sm-1-3 xs-50">
                      <div className="ss-img no-hover bradius">
                        <div className="img-bg" 
                          style={{ backgroundImage: `url('${values.icon.path}')` }} 
                        ></div>
                      </div>
                    </div>
                  ): (<></>)}
                  {values.image.path? (
                    <div className="grid xl-15 lg-20 md-25 sm-1-3 xs-50">
                      <div className="ss-img no-hover bradius">
                        <div className="img-bg" 
                          style={{ backgroundImage: `url('${values.image.path}')` }} 
                        ></div>
                      </div>
                    </div>
                  ): (<></>)}
                </div>
              </div>
            </div>
          ): (<></>)}
        </>
      ): (<></>)}

      {tabIndex === 1? (<MapLayerAttributes mapLayer={values} />): (<></>)}

      <Footer />
    </div>
  );
}

MapLayerViewPage.defaultProps = {
	
};
MapLayerViewPage.propTypes = {
	processRead: PropTypes.func.isRequired
};

const mapStateToProps = (state) => ({
	
});

export default connect(mapStateToProps, {
  setSidenavActiveIndex: setSidenavActiveIndex,
  processRead: processRead
})(MapLayerViewPage);