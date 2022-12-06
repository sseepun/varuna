import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { onMounted } from '../../helpers/frontend';
import Breadcrumb from '../../components/Breadcrumb';
import Footer from '../../components/Footer';

import { connect } from 'react-redux';
import { setSidenavActiveIndex } from '../../actions/app.actions';
import { processRead, processUpdate } from '../../actions/admin.actions';
import { UserModel} from '../../models';


function UserViewPage(props) {
  const user = new UserModel(props.user);
  const history = useNavigate();
  const params = useParams();
  const process = params.process? params.process: 'view';
  const dataId = params.dataId? params.dataId: null;

  const [values, setValues] = useState(new UserModel({ status: 1 }));
  
  /* eslint-disable */
	useEffect(() => { onMounted(); props.setSidenavActiveIndex(3); }, []);
	useEffect(() => {
    setValues(new UserModel({ status: 1 }));
    props.processRead('user', { _id: dataId, isUser: 1 }, true).then(d => {
      setValues(d);
    }).catch(() => history('/admin/users'));
  }, []);
  /* eslint-enable */

  return (
    <>
      <div className="app-container">
        <Breadcrumb 
          title={`${process} User`} 
          structure={[
            { title: 'User', to: '/admin' },
            { title: 'User Management', to: '/admin/users' }
          ]}
        />

        <div className="app-card mt-4">
          <div className="avatar-profile">
            <div className="avatar-img">
              <div className="avatar xxl">
                <div className="avatar-bg" 
                  style={{
                    backgroundImage: `url('${values.avatar.path
                      ? values.avatar.path: '/assets/img/default/avatar.jpg'}')`
                  }} 
                ></div>
              </div>
            </div>
            {values.isValid()? (
              <div className="avatar-desc">
                <h5 className="fw-500 lh-sm">{values.displayName()}</h5>
                <p className="fw-500 op-60">Role : {values.displayRole()}</p>
                <div className="btns mt-2">
                  {user.isAdmin() && !values.isAdmin()? (
                    <Link to={`/admin/user/update/${dataId}`} className="btn btn-action btn-p btn-xs">
                      <em className="fa-regular fa-pen-to-square mr-1"></em> Update
                    </Link>
                  ): (<></>)}
                  <Link to="/admin/users" className="btn btn-action btn-default btn-xs">
                    Back
                  </Link>
                </div>
              </div>
            ): (<></>)}
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
    </>
  );
}

UserViewPage.defaultProps = {
	
};
UserViewPage.propTypes = {
  setSidenavActiveIndex: PropTypes.func.isRequired,
	processRead: PropTypes.func.isRequired,
  processUpdate: PropTypes.func.isRequired
};

const mapStateToProps = (state) => ({
	user: state.user.user
});

export default connect(mapStateToProps, {
  setSidenavActiveIndex: setSidenavActiveIndex,
  processRead: processRead,
  processUpdate: processUpdate
})(UserViewPage);