import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { onMounted } from '../../helpers/frontend';
import Breadcrumb from '../../components/Breadcrumb';
import Footer from '../../components/Footer';
import AvatarUploader from '../../components/AvatarUploader';
import PasswordValidator from '../../components/PasswordValidator';
import Select from 'react-select';

import { connect } from 'react-redux';
import { setSidenavActiveIndex } from '../../actions/app.actions';
import { processCreate, processRead, processUpdate } from '../../actions/admin.actions';
import { UserModel, AddressModel } from '../../models';


function PartnerPage(props) {
  const history = useNavigate();
  const params = useParams();
  const process = params.process? params.process: 'create';
  const dataId = params['*']? params['*']: null;

  const [values, setValues] = useState(new UserModel({ status: 1 }));
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

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    if(process === 'create'){
      let res = await props.processCreate('user',  {
        ...values, address: address, roleLevel: 10,
        password: password, confirmPassword: confirmPassword
      }, true);
      if(res) history(`/admin/partners`);
    }else if(process === 'update'){
      let updateInput = { ...values, address: address };
      if(password) updateInput['password'] = password;
      if(confirmPassword) updateInput['confirmPassword'] = confirmPassword;
      await props.processUpdate('user', updateInput, true).then(() => {
        setPassword('');
        setConfirmPassword('');
      });
    }
  };

  /* eslint-disable */
	useEffect(() => { onMounted(); props.setSidenavActiveIndex(21); }, []);
	useEffect(() => {
    if(['create', 'view', 'update'].indexOf(process) < 0){
      history('/admin/partners');
    }else{
      if(['view', 'update'].indexOf(process) > -1){
        props.processRead('user', { _id: dataId, isPartner: 1 }, true).then(d => {
          setValues(d);
          setAddress(d.address);
        }).catch(() => history('/admin/partners'));
      }
    }
  }, []);
  /* eslint-enable */

  return (
    <div className="app-container">
      <Breadcrumb 
        title={`${process} Partner`} 
        structure={[
          { title: 'Admin', to: '/admin' },
          { title: 'Partner Management', to: '/admin/partners' }
        ]}
      />

      <div className="app-card p-0 mt-4">
        <form onSubmit={onSubmit}>
          <div className="app-card-block">
            <p className="lg fw-800">ข้อมูลบัญชีผู้ใช้</p>
            <div className="ss-sep-01 mt-3"></div>
            <div className="grids">
              <div className="grid sm-50 md-50 lg-40 xl-1-3">
                <div className="form-control">
                  <label>ชื่อจริง <span className="color-danger">*</span></label>
                  <input
                    type="text" disabled={process==='view'} required={true} 
                    value={values.firstname? values.firstname: ''} 
                    onChange={e => onChangeInput('firstname', e.target.value)} 
                  />
                </div>
              </div>
              <div className="grid sm-50 md-50 lg-40 xl-1-3">
                <div className="form-control">
                  <label>นามสกุล <span className="color-danger">*</span></label>
                  <input
                    type="text" disabled={process==='view'} required={true} 
                    value={values.lastname? values.lastname: ''} 
                    onChange={e => onChangeInput('lastname', e.target.value)} 
                  />
                </div>
              </div>
              <div className="sep"></div>
              <div className="grid sm-50 md-50 lg-40 xl-1-3">
                <div className="form-control">
                  <label>ชื่อผู้ใช้ <span className="color-danger">*</span></label>
                  <input
                    type="text" disabled={process==='view'} required={true} 
                    value={values.username? values.username: ''} 
                    onChange={e => onChangeInput('username', e.target.value)} 
                  />
                </div>
              </div>
              <div className="grid sm-50 md-50 lg-40 xl-1-3">
                <div className="form-control">
                  <label>อีเมล <span className="color-danger">*</span></label>
                  <input
                    type="email" disabled={process==='view'} required={true} 
                    value={values.email? values.email: ''} 
                    onChange={e => onChangeInput('email', e.target.value)} 
                  />
                </div>
              </div>
              <div className="sep"></div>
              <div className="grid sm-50 md-50 lg-40 xl-1-3">
                <div className="form-control">
                  <label>สถานะ <span className="color-danger">*</span></label>
                  <select 
                    disabled={process==='view'} required={true} 
                    value={values.status || values.status===0? values.status: ''} 
                    onChange={e => onChangeInput('status', e.target.value, true)} 
                  >
                    <option value="1">เปิดใช้งาน</option>
                    <option value="0">ปิดใช้งาน</option>
                  </select>
                </div>
              </div>
              <div className="grid sm-50 md-50 lg-40 xl-1-3">
                <AvatarUploader
                  process={process} avatar={values.avatar} 
                  onChangeAvatar={onChangeFile('avatar')} 
                />
              </div>
            </div>
          </div>
          {process !== 'view'? (
            <div className="app-card-block">
              <p className="lg fw-800">ข้อมูลรหัสผ่าน</p>
              <div className="ss-sep-01 mt-3"></div>
              <div className="grids">
                <div className="grid sm-50 md-50 lg-40 xl-1-3">
                  <div className="form-control">
                    <label>
                      รหัสผ่าน{process==='create'? (
                        <> <span className="color-danger">*</span></>
                      ): (<>ใหม่</>)}
                    </label>
                    <input
                      type="password" disabled={process==='view'} 
                      value={password} required={process==='create'} 
                      onChange={e => setPassword(e.target.value)} 
                    />
                  </div>
                  <div className="mt-2">
                    <PasswordValidator process={process} password={password} />
                  </div>
                </div>
                <div className="grid sm-50 md-50 lg-40 xl-1-3">
                  <div className="form-control">
                    <label>
                      ยืนยันรหัสผ่าน{process==='create'? (
                        <> <span className="color-danger">*</span></>
                      ): (<>ใหม่</>)}
                    </label>
                    <input
                      type="password" disabled={process==='view'} 
                      value={confirmPassword} required={process==='create'} 
                      onChange={e => setConfirmPassword(e.target.value)} 
                    />
                  </div>
                </div>
              </div>
            </div>
          ): (<></>)}
          <div className="app-card-block">
            <p className="lg fw-800">ข้อมูลติดต่อ</p>
            <div className="ss-sep-01 mt-3"></div>
            <div className="grids">
              <div className="grid sm-50 md-50 lg-40 xl-1-3">
                <div className="form-control">
                  <label>เบอร์โทรศัพท์</label>
                  <input
                    type="text" disabled={process==='view'} 
                    value={address.telephone? address.telephone: ''} 
                    onChange={e => onChangeInputAddress('telephone', e.target.value)} 
                  />
                </div>
              </div>
              <div className="sep"></div>
              <div className="grid sm-100 md-100 lg-80 xl-2-3">
                <div className="form-control">
                  <label>ที่อยู่</label>
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
                  <label>จังหวัด</label>
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
                  <label>{address.prefixDistrict()}</label>
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
                  <label>{address.prefixSubdistrict()}</label>
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
                  <label>รหัสไปรษณีย์</label>
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
          <div className="app-card-block border-top-1 bcolor-fgray pt-0">
            <div className="btns">
              {['create', 'update'].indexOf(process) > -1? (
                <button type="submit" className="btn btn-action btn-p">
                  {process==='create'? 'สร้าง': 'แก้ไข'}ข้อมูล
                </button>
              ): (<></>)}
              {process === 'update'? (
                <Link to={`/admin/partner/view/${dataId}`} className="btn btn-action btn-p-border">
                  ดูข้อมูล
                </Link>
              ): (<></>)}
              <Link to="/admin/partners" className="btn btn-action btn-default">
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

PartnerPage.defaultProps = {
	
};
PartnerPage.propTypes = {
  setSidenavActiveIndex: PropTypes.func.isRequired,
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
})(PartnerPage);