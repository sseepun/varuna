import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { onMounted, appLogo } from '../../helpers/frontend';
import PasswordValidator from '../../components/PasswordValidator';

import { connect } from 'react-redux';
import { setSidenavActiveIndex } from '../../actions/app.actions';
import { userCheckResetPassword, userResetPassword } from '../../actions/user.actions';


function ResetPasswordPage(props) {
  const history = useNavigate();
  const params = useParams();
  const token = params['*']? params['*']: null;

  const [process, setProcess] = useState(false);
  
  const [values, setValues] = useState({
    resetToken: token, newPassword: '', confirmNewPassword: ''
  });
  const onChangeInput = (key, val) => {
    setValues({ ...values, [key]: val });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    let res = await props.processResetPassword(values);
    if(res){
      setValues({ resetToken: '', newPassword: '', confirmNewPassword: '' });
      setProcess(true);
    }
  };
  
  /* eslint-disable */
	useEffect(() => { onMounted(); }, []);
	useEffect(async () => {
    let res = await props.processCheckResetPassword(token);
    if(!res) history('/');
  }, []);
  /* eslint-enable */

  return (
    <section className="auth-01 section-padding">
      <div className="bg-img" style={{ backgroundImage: `url('/assets/img/bg/01.jpg')` }}></div>
      <div className="container">
        <div className="auth-container bradius box-shadow">
          <div className="auth-body bg-white">
            <div className="title">
              <img className="logo" src={appLogo()} alt="Logo" />
              <div className="text">
                <h5 className="fw-900 lh-sm">Reset Password</h5>
                <p className="fw-600 op-70">Back Office System</p>
              </div>
            </div>
            {!process? (
              <>
                <form onSubmit={onSubmit}>
                  <div className="grids mt-4">
                    <div className="grid sm-100">
                      <div className="form-control">
                        <input
                          type="password" required={true} placeholder="New Password *" 
                          value={values.newPassword? values.newPassword: ''} className="lg" 
                          onChange={e => onChangeInput('newPassword', e.target.value)} 
                        />
                      </div>
                    </div>
                    <div className="grid sm-100">
                      <div className="form-control">
                        <input
                          type="password" required={true} placeholder="Confirm New Password *" 
                          value={values.confirmNewPassword? values.confirmNewPassword: ''} className="lg" 
                          onChange={e => onChangeInput('confirmNewPassword', e.target.value)} 
                        />
                      </div>
                    </div>
                    <div className="grid sm-100">
                      <PasswordValidator password={values.newPassword} />
                    </div>
                  </div>
                  <div className="btns">
                    <button type="submit" className="btn btn-action btn-p btn-lg w-full">
                      Reset Password
                    </button>
                  </div>
                </form>
                <p className="sm color-gray text-center mt-6">
                  <Link to="/auth/signin" className="color-s h-color-p fw-600">
                    Back to Sign In
                  </Link>
                </p>
              </>
            ): (
              <>
                <p className="fw-500 text-center mt-6">
                  You have successfully reset your password.
                </p>
                <div className="btns pt-2">
                  <Link to="/auth/signin" className="btn btn-action btn-p w-full">
                    Back to Sign In
                  </Link>
                </div>
              </>
            )}
          </div>
          <div className="auth-footer bg-s color-white">
            <p className="xxs fw-300 text-center">
              © 2022 Varuna. <span className="xs-hide">All rights reserved.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

ResetPasswordPage.defaultProps = {
	
};
ResetPasswordPage.propTypes = {
	setSidenavActiveIndex: PropTypes.func.isRequired,
	processCheckResetPassword: PropTypes.func.isRequired,
  processResetPassword: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  
});

export default connect(mapStateToProps, {
  setSidenavActiveIndex: setSidenavActiveIndex,
  processCheckResetPassword: userCheckResetPassword,
  processResetPassword: userResetPassword,
})(ResetPasswordPage);