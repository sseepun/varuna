import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { onMounted } from '../../helpers/frontend';
import Breadcrumb from '../../components/Breadcrumb';
import Footer from '../../components/Footer';

import { connect } from 'react-redux';
import { setSidenavActiveIndex } from '../../actions/app.actions';
import { UserModel } from '../../models';


function ProfileViewPage(props) {
  const user = new UserModel(props.user);

  const values = new UserModel(user);
  
  /* eslint-disable */
	useEffect(() => { onMounted(); props.setSidenavActiveIndex(0); }, []);
  /* eslint-enable */

  return (
    <div className="app-container">
      <Breadcrumb 
        title={`Profile`} 
        structure={[
          { title: 'Admin', to: '/admin' },
          { title: 'Profile', to: '/admin/profile' }
        ]}
      />

      <div className="app-card mt-4">
        <div className="avatar-profile">
          <div className="avatar-img">
            <div className="avatar xxl">
              <div className="avatar-bg" style={{ backgroundImage: `url('${values.avatar.path}')` }}></div>
            </div>
          </div>
          <div className="avatar-desc">
            <h5 className="fw-500 lh-sm">{values.displayName()}</h5>
            <p className="fw-500 op-60">Role : {values.displayRole()}</p>
            <div className="btns mt-2">
              <Link to={`/admin/profile/update`} className="btn btn-action btn-s btn-xs">
                <em className="fa-regular fa-pen-to-square mr-1"></em> Update
              </Link>
              <Link to="/admin" className="btn btn-action btn-default btn-xs">
                Back
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="app-card p-0 mt-4">
        <div className="app-card-block">
          <p className="lg fw-800">Account Information</p>
          <div className="ss-sep-01 mt-3"></div>
          <div className="grids">
            <div className="grid lg-40 md-50 sm-100">
              <span className="fw-700">Full name :</span> {values.displayName()}
            </div>
            <div className="grid lg-40 md-50 sm-100">
              <span className="fw-700">Username :</span> {values.username}
            </div>
            <div className="sep"></div>
            <div className="grid lg-40 md-50 sm-100">
              <span className="fw-700">Email :</span> {values.email}
            </div>
            <div className="grid lg-40 md-50 sm-100">
              <span className="fw-700">Telephone :</span> {values.telephone? values.telephone: '-'}
            </div>
            <div className="sep"></div>
            <div className="grid lg-40 md-50 sm-100">
              <span className="fw-700">Status :</span> {values.displayStatus()}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

ProfileViewPage.defaultProps = {
	
};
ProfileViewPage.propTypes = {
  
};

const mapStateToProps = (state) => ({
	user: state.user.user
});

export default connect(mapStateToProps, {
  setSidenavActiveIndex: setSidenavActiveIndex
})(ProfileViewPage);