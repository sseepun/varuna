import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { onMounted } from '../../helpers/frontend';
import Breadcrumb from '../../components/Breadcrumb';
import Footer from '../../components/Footer';
import AvatarUploader from '../../components/AvatarUploader';
import PasswordValidator from '../../components/PasswordValidator';

import { connect } from 'react-redux';
import { setSidenavActiveIndex } from '../../actions/app.actions';
import {
  processClear, processCreate, processRead, processUpdate
} from '../../actions/admin.actions';
import { UserModel } from '../../models';


function AdminPage(props) {
  const user = new UserModel(props.user);
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

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    if(process === 'create'){
      let res = await props.processCreate('user',  {
        ...values, roleLevel: 98,
        password: password, confirmPassword: confirmPassword
      }, true);
      if(res) history(`/admin/admins`);
    }else if(process === 'update'){
      let updateInput = { ...values };
      if(password) updateInput['password'] = password;
      if(confirmPassword) updateInput['confirmPassword'] = confirmPassword;
      await props.processUpdate('user', updateInput, true).then(() => {
        setPassword('');
        setConfirmPassword('');
      });
    }
  };

  /* eslint-disable */
	useEffect(() => { onMounted(); props.setSidenavActiveIndex(2); }, []);
	useEffect(() => {
    if(!user.isSuperAdmin() || ['create', 'view', 'update'].indexOf(process) < 0){
      history('/admin/admins');
    }else{
      if(['view', 'update'].indexOf(process) > -1){
        props.processRead('user', { _id: dataId, isAdmin: 1 }, true).then(d => {
          setValues(d);
        }).catch(() => history('/admin/admins'));
      }
    }
  }, []);
  /* eslint-enable */

  return (
    <div className="app-container">
      <Breadcrumb 
        title={`${process} Admin`} 
        structure={[
          { title: 'Admin', to: '/admin' },
          { title: 'Admin Management', to: '/admin/admins' }
        ]}
      />

      <div className="app-card p-0 mt-4">
        <form onSubmit={onSubmit}>
          <div className="app-card-block">
            <p className="lg fw-800">Account Information</p>
            <div className="ss-sep-01 mt-3"></div>
            <div className="grids">
              <div className="grid sm-50 md-50 lg-40 xl-1-3">
                <div className="form-control">
                  <label>First name <span className="color-danger">*</span></label>
                  <input
                    type="text" disabled={process==='view'} required={true} 
                    value={values.firstname? values.firstname: ''} 
                    onChange={e => onChangeInput('firstname', e.target.value)} 
                  />
                </div>
              </div>
              <div className="grid sm-50 md-50 lg-40 xl-1-3">
                <div className="form-control">
                  <label>Last name <span className="color-danger">*</span></label>
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
                  <label>Username <span className="color-danger">*</span></label>
                  <input
                    type="text" disabled={process==='view'} required={true} 
                    value={values.username? values.username: ''} 
                    onChange={e => onChangeInput('username', e.target.value)} 
                  />
                </div>
              </div>
              <div className="grid sm-50 md-50 lg-40 xl-1-3">
                <div className="form-control">
                  <label>Email <span className="color-danger">*</span></label>
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
                  <label>Telephone</label>
                  <input
                    type="text" disabled={process==='view'} 
                    value={values.telephone? values.telephone: ''} 
                    onChange={e => onChangeInput('telephone', e.target.value)} 
                  />
                </div>
              </div>
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
              <div className="sep"></div>
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
              <p className="lg fw-800">Password Information</p>
              <div className="ss-sep-01 mt-3"></div>
              <div className="grids">
                <div className="grid sm-50 md-50 lg-40 xl-1-3">
                  <div className="form-control">
                    <label>
                      {process==='create'? ('Password'): ('New password')}
                      {process==='create'? (
                        <> <span className="color-danger">*</span></>
                      ): (<></>)}
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
                      {process==='create'? ('Confirm password'): ('Confirm new password')}
                      {process==='create'? (
                        <> <span className="color-danger">*</span></>
                      ): (<></>)}
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
          <div className="app-card-block border-top-1 bcolor-fgray pt-0">
            <div className="btns">
              {['create', 'update'].indexOf(process) > -1? (
                <button type="submit" className="btn btn-action btn-s">
                  {process==='create'? 'Create': 'Update'}
                </button>
              ): (<></>)}
              {process === 'update'? (
                <Link to={`/admin/admin/view/${dataId}`} className="btn btn-action btn-s-border">
                  View
                </Link>
              ): (<></>)}
              <Link to="/admin/admins" className="btn btn-action btn-default">
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

AdminPage.defaultProps = {
	
};
AdminPage.propTypes = {
  processClear: PropTypes.func.isRequired,
  processCreate: PropTypes.func.isRequired,
	processRead: PropTypes.func.isRequired,
	processUpdate: PropTypes.func.isRequired
};

const mapStateToProps = (state) => ({
	user: state.user.user
});

export default connect(mapStateToProps, {
  setSidenavActiveIndex: setSidenavActiveIndex,
  processClear: processClear,
  processCreate: processCreate,
  processRead: processRead,
  processUpdate: processUpdate
})(AdminPage);