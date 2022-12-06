import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { onMounted } from '../../helpers/frontend';
import Breadcrumb from '../../components/Breadcrumb';
import Footer from '../../components/Footer';
import ImageUploader from '../../components/ImageUploader';

import { connect } from 'react-redux';
import { setSidenavActiveIndex } from '../../actions/app.actions';
import { processRead } from '../../actions/admin.actions';
import { MapLayerModel } from '../../models';


function MapLayerViewPage(props) {
  const history = useNavigate();
  const params = useParams();
  const process = params.process? params.process: 'view';
  const dataId = params.dataId? params.dataId: null;

  const [values, setValues] = useState(new MapLayerModel({ status: 1 }));

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
        title={`${process} Map Layer`} 
        structure={[
          { title: 'Admin', to: '/admin' },
          { title: 'Map Layers', to: '/admin/map-layers' }
        ]}
      />

      <div className="app-card p-0 mt-4">
        <div className="app-card-block pt-0">
          <div className="grids">
            <div className="grid sm-100 lg-80 xl-2-3">
              <div className="form-control">
                <label>Layer name <span className="color-danger">*</span></label>
                <input
                  type="text" disabled={process==='view'} required={true} 
                  value={values.name? values.name: ''} 
                />
              </div>
            </div>
            <div className="sep"></div>
            <div className="grid sm-100 md-100 lg-80 xl-2-3">
              <div className="form-control">
                <label>Description</label>
                <textarea
                  type="text" disabled={process==='view'} rows={2} 
                  value={values.description? values.description: ''} 
                ></textarea>
              </div>
            </div>
            <div className="sep"></div>
            <div className="grid sm-50 md-50 lg-40 xl-1-3">
              <div className="form-control">
                <label>Image</label>
                <ImageUploader
                  process={process} images={[values.image]} 
                />
              </div>
            </div>
            <div className="grid sm-50 md-50 lg-40 xl-1-3">
              <div className="form-control">
                <label>Icon <span className="color-danger">*</span></label>
                <ImageUploader
                  process={process} images={[values.icon]} required={true} 
                />
              </div>
            </div>
            <div className="sep"></div>
            <div className="grid sm-50 md-50 lg-40 xl-1-3">
              <div className="form-control">
                <label>Status <span className="color-danger">*</span></label>
                <select 
                  disabled={process==='view'} required={true} 
                  value={values.status || values.status===0? values.status: ''} 
                >
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="app-card-block border-top-1 bcolor-fgray pt-0">
          <div className="btns">
            <Link to={`/admin/map-layer/update/${dataId}`} className="btn btn-action btn-p-border">
              Update
            </Link>
            <Link to="/admin/map-layers" className="btn btn-action btn-default">
              Back
            </Link>
          </div>
        </div>
      </div>

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