import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { onMounted, appLogo } from '../../helpers/frontend';

import { connect } from 'react-redux';
import { setSidenavActiveIndex } from '../../actions/app.actions';
import { userForgetPassword } from '../../actions/user.actions';


function ForgetPasswordPage(props) {
  const [process, setProcess] = useState(false);
  
  const [values, setValues] = useState({ email: '' });
  const onChangeInput = (key, val) => {
    setValues({ ...values, [key]: val });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    let res = await props.processForgetPassword(values);
    if(res){
      onChangeInput('email', '');
      setProcess(true);
    }
  };
  
  /* eslint-disable */
	useEffect(() => { onMounted(); }, []);
  /* eslint-enable */

  return (
    <section className="auth-01 section-padding">
      <div className="bg-img" style={{ backgroundImage: `url('/assets/img/bg/01.jpg')` }}></div>
      <div className="filter"></div>
      <div className="container">
        <div className="auth-container bradius box-shadow">
          <div className="auth-body bg-white">
            <div className="title">
              <img className="logo" src={appLogo()} alt="Logo" />
              <div className="text">
                <h5 className="fw-900 lh-sm">Forget Password</h5>
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
                          type="email" required={true} placeholder="Your Email *" 
                          value={values.email? values.email: ''} className="lg" 
                          onChange={e => onChangeInput('email', e.target.value)} 
                        />
                      </div>
                    </div>
                  </div>
                  <div className="btns">
                    <button type="submit" className="btn btn-action btn-p btn-lg w-full">
                      Request to Reset Password
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
                  You have successfully requested to reset your password. 
                  Please check your email for the next steps.
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

ForgetPasswordPage.defaultProps = {
	
};
ForgetPasswordPage.propTypes = {
	setSidenavActiveIndex: PropTypes.func.isRequired,
	processForgetPassword: PropTypes.func.isRequired
};

const mapStateToProps = (state) => ({
  
});

export default connect(mapStateToProps, {
  setSidenavActiveIndex: setSidenavActiveIndex,
  processForgetPassword: userForgetPassword
})(ForgetPasswordPage);