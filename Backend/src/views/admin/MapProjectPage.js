import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { onMounted } from '../../helpers/frontend';
import Breadcrumb from '../../components/Breadcrumb';
import Footer from '../../components/Footer';
import ImageUploader from '../../components/ImageUploader';
import Select from 'react-select';

import { connect } from 'react-redux';
import { setSidenavActiveIndex } from '../../actions/app.actions';
import { processCreate, processRead, processUpdate } from '../../actions/admin.actions';
import { MapProjectModel, AddressModel } from '../../models';


function MapProjectPage(props) {
  const history = useNavigate();
  const params = useParams();
  const process = params.process? params.process: 'create';
  const dataId = params['*']? params['*']: null;

  const [values, setValues] = useState(new MapProjectModel({ status: 1 }));
  const onChangeInput = (key, val, isNumber=false) => {
    if(isNumber) val = val || val===0? Number(val): '';
    setValues({ ...values, [key]: val });
  };
  const onChangeFile = (key) => (val) => {
    onChangeInput(key, val);
  };

  const [address, setAddress] = useState(new AddressModel({}));
  const onChangeInputAddress = (key, val, selector=false) => {
    if(selector && val) val = val.value;
    if(key === 'province'){
      setAddress(new AddressModel({
        ...address, province: val, district: null, subdistrict: null, zipcode: null
      }));
    }else if(key === 'district'){
      setAddress(new AddressModel({
        ...address, district: val, subdistrict: null, zipcode: null
      }));
    }else if(key === 'subdistrict'){
      setAddress(new AddressModel({
        ...address, subdistrict: val, zipcode: null
      }));
    }else{
      setAddress(new AddressModel({ ...address, [key]: val }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if(process === 'create'){
      let res = await props.processCreate('map-project', {
        ...values, mapLocation: address
      }, true);
      if(res) history(`/admin/map-project/view/${res.data}`);
    }else if(process === 'update'){
      let updateInput = { ...values, mapLocation: address };
      await props.processUpdate('map-project', updateInput, true);
    }
  };

  /* eslint-disable */
	useEffect(() => { onMounted(); props.setSidenavActiveIndex(22); }, []);
	useEffect(() => {
    if(['create', 'view', 'update'].indexOf(process) < 0){
      history('/admin/map-projects');
    }else{
      if(['view', 'update'].indexOf(process) > -1){
        props.processRead('map-project', { _id: dataId }, true).then(d => {
          setValues(d);
          setAddress(d.mapLocation);
        }).catch(() => history('/admin/map-projects'));
      }
    }
  }, []);
  /* eslint-enable */

  return (
    <div className="app-container">
      <Breadcrumb 
        title={`${process} Map Data`} 
        structure={[
          { title: 'Admin', to: '/admin' },
          { title: 'Map Projects', to: '/admin/map-projects' }
        ]}
      />

      <div className="app-card p-0 mt-4">
        <form onSubmit={onSubmit}>
          <div className="app-card-block">
            <p className="lg fw-800">Project Information</p>
            <div className="ss-sep-01 mt-3"></div>
            <div className="grids">
              <div className="grid sm-100 lg-80 xl-2-3">
                <div className="form-control">
                  <label>Project name <span className="color-danger">*</span></label>
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
                  <label>Description</label>
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
                  <label>Status <span className="color-danger">*</span></label>
                  <select 
                    disabled={process==='view'} required={true} 
                    value={values.status || values.status===0? values.status: ''} 
                    onChange={e => onChangeInput('status', e.target.value, true)} 
                  >
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <div className="app-card-block">
            <p className="lg fw-800">Address Information</p>
            <div className="ss-sep-01 mt-3"></div>
            <div className="grids">
              <div className="grid sm-100 md-100 lg-80 xl-2-3">
                <div className="form-control">
                  <label>Address</label>
                  <textarea
                    type="text" disabled={process==='view'} rows={2} 
                    value={address.address? address.address: ''} 
                    onChange={e => onChangeInputAddress('address', e.target.value)} 
                  ></textarea>
                </div>
              </div>
              <div className="sep"></div>
              <div className="grid sm-50 md-50 lg-40 xl-1-3">
                <div className="form-control">
                  <label>Province</label>
                  <Select 
                    className={`select-multi ${process === 'view'? 'disabled': ''}`} 
                    isMulti={false} placeholder="" 
                    isDisabled={process === 'view'} isClearable={true} 
                    options={address.provinces().map(d => {
                      return { value: d.nameTH, label: d.nameTH };
                    })} 
                    value={address.province? { value: address.province, label: address.province }: ''} 
                    onChange={val => onChangeInputAddress('province', val, true)} 
                  />
                </div>
              </div>
              <div className="grid sm-50 md-50 lg-40 xl-1-3">
                <div className="form-control">
                  <label>District</label>
                  <Select 
                    className={`select-multi ${process === 'view'? 'disabled': ''}`} 
                    isMulti={false} placeholder="" 
                    isDisabled={process === 'view'} isClearable={true} 
                    options={address.districts().map(d => {
                      return { value: d.nameTH, label: d.nameTH };
                    })} 
                    value={address.district? { value: address.district, label: address.district }: ''} 
                    onChange={val => onChangeInputAddress('district', val, true)} 
                  />
                </div>
              </div>
              <div className="sep"></div>
              <div className="grid sm-50 md-50 lg-40 xl-1-3">
                <div className="form-control">
                  <label>Subdistrict</label>
                  <Select 
                    className={`select-multi ${process === 'view'? 'disabled': ''}`} 
                    isMulti={false} placeholder="" 
                    isDisabled={process === 'view'} isClearable={true} 
                    options={address.subdistricts().map(d => {
                      return { value: d.nameTH, label: d.nameTH };
                    })} 
                    value={address.subdistrict? { value: address.subdistrict, label: address.subdistrict }: ''} 
                    onChange={val => onChangeInputAddress('subdistrict', val, true)} 
                  />
                </div>
              </div>
              <div className="grid sm-50 md-50 lg-40 xl-1-3">
                <div className="form-control">
                  <label>Zipcode</label>
                  <Select 
                    className={`select-multi ${process === 'view'? 'disabled': ''}`} 
                    isMulti={false} placeholder="" 
                    isDisabled={process === 'view'} isClearable={true} 
                    options={address.zipcodes().map(d => {
                      return { value: d.zipcode, label: d.zipcode };
                    })} 
                    value={address.zipcode? { value: address.zipcode, label: address.zipcode }: ''} 
                    onChange={val => onChangeInputAddress('zipcode', val, true)} 
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="app-card-block">
            <p className="lg fw-800">Image Information</p>
            <div className="ss-sep-01 mt-3"></div>
            <div className="grids">
              <div className="grid sm-50 md-50 lg-40 xl-1-3">
                <div className="form-control">
                  <label>Image</label>
                  <ImageUploader
                    process={process} images={[values.image]} 
                    onChangeImage={onChangeFile('image')} isMultiple={false} 
                  />
                </div>
              </div>
              <div className="grid sm-50 md-50 lg-40 xl-1-3">
                <div className="form-control">
                  <label>Gallery</label>
                  <ImageUploader
                    process={process} images={values.gallery} required={false} 
                    onChangeImage={onChangeFile('gallery')} isMultiple={true} 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="app-card-block border-top-1 bcolor-fgray pt-0">
            <div className="btns">
              {['create', 'update'].indexOf(process) > -1? (
                <button type="submit" className="btn btn-action btn-s">
                  {process==='create'? 'Create': 'Update'}
                </button>
              ): (<></>)}
              {process === 'update'? (
                <Link to={`/admin/map-project/view/${dataId}`} className="btn btn-action btn-s-border">
                  View
                </Link>
              ): (<></>)}
              <Link to="/admin/map-projects" className="btn btn-action btn-default">
                Back
              </Link>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}

MapProjectPage.defaultProps = {
	
};
MapProjectPage.propTypes = {
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
})(MapProjectPage);