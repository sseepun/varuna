import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { onMounted } from '../../helpers/frontend';
import Breadcrumb from '../../components/Breadcrumb';
import Footer from '../../components/Footer';
import AvatarUploader from '../../components/AvatarUploader';
import PasswordValidator from '../../components/PasswordValidator';
import Select from 'react-select';

import { connect } from 'react-redux';
import { setSidenavActiveIndex } from '../../actions/app.actions';
import { userUpdate } from '../../actions/user.actions';
import { UserModel, AddressModel } from '../../models';


function ProfilePage(props) {
  const user = new UserModel(props.user);

  const [values, setValues] = useState(new UserModel(user));
  const onChangeInput = (key, val, isNumber=false) => {
    if(isNumber) val = val || val===0? Number(val): '';
    setValues({ ...values, [key]: val });
  };
  const onChangeFile = (key) => (val) => {
    onChangeInput(key, val);
  };

  const [address, setAddress] = useState(new AddressModel(user.address));
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
    await props.processUpdate('account', { ...values, address: address });
  };

  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const onSubmitPassword = async (e) => {
    e.preventDefault();
    await props.processUpdate('password', {
      oldPassword: oldPassword,
      newPassword: newPassword,
      confirmNewPassword: confirmNewPassword
    }).then(() => {
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    });
  };


  /* eslint-disable */
	useEffect(() => { onMounted(); props.setSidenavActiveIndex(0); }, []);
  /* eslint-enable */

  return (
    <div className="app-container">
      <Breadcrumb 
        title={`Profile Update`} 
        structure={[
          { title: 'Admin', to: '/admin' },
          { title: 'Profile Update', to: '/admin/profile/update' }
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
                    type="text" required={true} 
                    value={values.firstname? values.firstname: ''} 
                    onChange={e => onChangeInput('firstname', e.target.value)} 
                  />
                </div>
              </div>
              <div className="grid sm-50 md-50 lg-40 xl-1-3">
                <div className="form-control">
                  <label>นามสกุล <span className="color-danger">*</span></label>
                  <input
                    type="text" required={true} 
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
                    type="text" required={true} 
                    value={values.username? values.username: ''} 
                    onChange={e => onChangeInput('username', e.target.value)} 
                  />
                </div>
              </div>
              <div className="grid sm-50 md-50 lg-40 xl-1-3">
                <div className="form-control">
                  <label>อีเมล <span className="color-danger">*</span></label>
                  <input
                    type="email" required={true} 
                    value={values.email? values.email: ''} 
                    onChange={e => onChangeInput('email', e.target.value)} 
                  />
                </div>
              </div>
              <div className="sep"></div>
              <div className="grid sm-50 md-50 lg-40 xl-1-3">
                <AvatarUploader
                  avatar={values.avatar} 
                  onChangeAvatar={onChangeFile('avatar')} 
                />
              </div>
            </div>
          </div>
          <div className="app-card-block">
            <p className="lg fw-800">ข้อมูลติดต่อ</p>
            <div className="ss-sep-01 mt-3"></div>
            <div className="grids">
              <div className="grid sm-50 md-50 lg-40 xl-1-3">
                <div className="form-control">
                  <label>เบอร์โทรศัพท์</label>
                  <input
                    type="text" 
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
                    type="text" rows={2} 
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
                    className={`select-multi`} 
                    isMulti={false} placeholder="" 
                    isDisabled={false} isClearable={true} 
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
                    className={`select-multi`} 
                    isMulti={false} placeholder="" 
                    isDisabled={false} isClearable={true} 
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
                    className={`select-multi`} 
                    isMulti={false} placeholder="" 
                    isDisabled={false} isClearable={true} 
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
                    className={`select-multi`} 
                    isMulti={false} placeholder="" 
                    isDisabled={false} isClearable={true} 
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
              <button type="submit" className="btn btn-action btn-p">
                แก้ไขข้อมูล
              </button>
              <Link to="/admin/profile" className="btn btn-action btn-default">
                ย้อนกลับ
              </Link>
            </div>
          </div>
        </form>
      </div>

      <div className="app-card p-0 mt-4">
        <form onSubmit={onSubmitPassword}>
          <div className="app-card-block">
            <p className="lg fw-800">ตั้งรหัสผ่านใหม่</p>
            <div className="ss-sep-01 mt-3"></div>
            <div className="grids">
              <div className="grid sm-50 md-50 lg-40 xl-1-3">
                <div className="form-control">
                  <label>รหัสผ่านเก่า <span className="color-danger">*</span></label>
                  <input
                    type="password" required={true} 
                    value={oldPassword? oldPassword: ''} 
                    onChange={e => setOldPassword(e.target.value)} 
                  />
                </div>
              </div>
              <div className="sep"></div>
              <div className="grid sm-50 md-50 lg-40 xl-1-3">
                <div className="form-control">
                  <label>รหัสผ่านใหม่ <span className="color-danger">*</span></label>
                  <input
                    type="password" required={true} 
                    value={newPassword? newPassword: ''} 
                    onChange={e => setNewPassword(e.target.value)} 
                  />
                </div>
                <div className="mt-2">
                  <PasswordValidator password={newPassword} />
                </div>
              </div>
              <div className="grid sm-50 md-50 lg-40 xl-1-3">
                <div className="form-control">
                  <label>ยืนยันรหัสผ่านใหม่ <span className="color-danger">*</span></label>
                  <input
                    type="password" required={true} 
                    value={confirmNewPassword? confirmNewPassword: ''} 
                    onChange={e => setConfirmNewPassword(e.target.value)} 
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="app-card-block border-top-1 bcolor-fgray pt-0">
            <div className="btns">
              <button type="submit" className="btn btn-action btn-p">
                ตั้งรหัสผ่านใหม่
              </button>
              <Link to="/admin/profile" className="btn btn-action btn-default">
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

ProfilePage.defaultProps = {
	
};
ProfilePage.propTypes = {
	processUpdate: PropTypes.func.isRequired
};

const mapStateToProps = (state) => ({
	user: state.user.user
});

export default connect(mapStateToProps, {
  setSidenavActiveIndex: setSidenavActiveIndex,
  processUpdate: userUpdate
})(ProfilePage);