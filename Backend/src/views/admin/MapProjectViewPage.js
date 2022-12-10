import PropTypes from 'prop-types';
import { useState, useEffect, Fragment } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { onMounted } from '../../helpers/frontend';
import Breadcrumb from '../../components/Breadcrumb';
import Footer from '../../components/Footer';

import MapProjectData from '../../components/MapProjectData';

import { connect } from 'react-redux';
import { setSidenavActiveIndex } from '../../actions/app.actions';
import { processList, processRead, processUpdate } from '../../actions/admin.actions';
import { MapProjectModel, AddressModel } from '../../models';

function MapProjectViewPage(props) {
  const history = useNavigate();
  const params = useParams();
  const process = params.process? params.process: 'view';
  const dataId = params.dataId? params.dataId: null;

  const [values, setValues] = useState(new MapProjectModel({ status: 1 }));
  const [address, setAddress] = useState(new AddressModel({}));
  
  const [tabIndex, setTabIndex] = useState(0);
  const tabList = ['Project Information', 'Project Data', 'Permissions'];
  const onChangeTabIndex = (e, i) => {
    e.preventDefault();
    setTabIndex(i);
  };


  // START: Permission
  const [userList, setUserList] = useState([]);
  const [permissions, setPermissions] = useState([
    { userId: null, create: 0, read: 0, update: 0, delete: 0 }
  ]);
  const thisUserList = (userId='') => {
    let temp = [ ...userList ];
    let userIds = permissions.map(d => d.userId).filter(d => d !== userId);
    return temp.filter(d => userIds.indexOf(d._id) < 0);
  };
  const onAddPermission = () => {
    let temp = [ ...permissions ];
    temp.push({ userId: null, create: 0, read: 0, update: 0, delete: 0 });
    setPermissions(temp);
  };
  const onDeletePermission = (i) => {
    let temp = [ ...permissions ];
    temp.splice(i, 1);
    setPermissions(temp);
  };
  const onChangePermission = (i, key, val) => {
    let temp = [ ...permissions ];
    temp[i][key] = val;
    setPermissions(temp);
  };
  const onSubmitPermissions = async (e) => {
    e.preventDefault();
    await props.processUpdate('map-permission', {
      mapProjectId: dataId,
      permissions: permissions.filter(d => d.userId),
    }, true);
  };
  // END: Permission


  /* eslint-disable */
	useEffect(() => { onMounted(); props.setSidenavActiveIndex(22); }, []);
	useEffect(() => {
    props.processRead('map-project', { _id: dataId }, true).then(d => {
      setValues(d);
      setAddress(d.mapLocation);
    }).catch(() => history('/admin/map-projects'));
  }, []);
	useEffect(() => {
    if(tabIndex === 2){
      if(!userList.length){
        props.processList('users', { dataFilter: { levels: [1] }}).then(d => {
          if(d && d.result) setUserList(d.result);
        });
      }
      props.processList('map-permissions', { dataFilter: { mapProjectId: dataId }}).then(d => {
        if(d && d.result && d.result.length){
          setPermissions(d.result.map(k => {
            return {
              userId: k.user._id,
              create: k.create? Number(k.create): 0,
              read: k.read? Number(k.read): 0,
              update: k.update? Number(k.update): 0,
              delete: k.delete? Number(k.delete): 0,
            };
          }));
        }
      });
    }
  }, [tabIndex]);
  /* eslint-enable */

  return (
    <div className="app-container">
      <Breadcrumb 
        title={`${process} Map Project`} 
        structure={[
          { title: 'Admin', to: '/admin' },
          { title: 'Map Projects', to: '/admin/map-projects' }
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
                <p className="fw-500 color-gray op-0">
                  Status : <span className="fw-700 color-p">{values.displayStatus()}</span> 
                </p>
                <div className="btns mt-2">
                  <Link to={`/admin/map-project/update/${dataId}`} className="btn btn-action btn-p btn-xs">
                    <em className="fa-regular fa-pen-to-square mr-1"></em> Update
                  </Link>
                  <Link to="/admin/map-projects" className="btn btn-action btn-default btn-xs">
                    Back
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
              <p className="lg fw-800">Project Information</p>
              <div className="ss-sep-01 mt-3"></div>
              <div className="grids">
                <div className="grid lg-40 md-50 sm-100">
                  <span className="fw-700">Project name :</span> {values.name}
                </div>
                <div className="grid lg-40 md-50 sm-100">
                  <span className="fw-700">Status :</span> {values.displayStatus()}
                </div>
                <div className="sep"></div>
                <div className="grid lg-80 md-100 sm-100">
                  <span className="fw-700">Description :</span> {values.description? values.description: '-'}
                </div>
              </div>
            </div>
          </div>
          <div className="app-card p-0 mt-4">
            <div className="app-card-block">
              <p className="lg fw-800">Address Information</p>
              <div className="ss-sep-01 mt-3"></div>
              <div className="grids">
                <div className="sep"></div>
                <div className="grid lg-80 md-100 sm-100">
                  <span className="fw-700">Address :</span> {address.address? address.address: '-'}
                </div>
                <div className="sep"></div>
                <div className="grid lg-40 md-50 sm-100">
                  <span className="fw-700">Subdistrict :</span> {address.subdistrict? address.subdistrict: '-'}
                </div>
                <div className="grid lg-40 md-50 sm-100">
                  <span className="fw-700">District :</span> {address.district? address.district: '-'}
                </div>
                <div className="sep"></div>
                <div className="grid lg-40 md-50 sm-100">
                  <span className="fw-700">Province :</span> {address.province? address.province: '-'}
                </div>
                <div className="grid lg-40 md-50 sm-100">
                  <span className="fw-700">Zipcode :</span> {address.zipcode? address.zipcode: '-'}
                </div>
              </div>
            </div>
          </div>
          <div className="app-card p-0 mt-4">
            <div className="app-card-block">
              <p className="lg fw-800">Image Information</p>
              <div className="ss-sep-01 mt-3"></div>
              <div className="gallery-grids pt-3">
                <div className="grid xl-15 lg-20 md-25 sm-1-3 xs-50">
                  <div className="ss-img no-hover bradius">
                    <div className="img-bg" 
                      style={{
                        backgroundImage: `url('${values.image.path
                          ? values.image.path: '/assets/img/default/img.jpg'}')`
                      }} 
                    ></div>
                  </div>
                </div>
                {values.gallery && values.gallery.length? (
                  values.gallery.map((d, i) => (
                    <Fragment key={`gallery_${i}`}>
                      {d.path? (
                        <div className="grid xl-15 lg-20 md-25 sm-1-3 xs-50">
                          <div className="ss-img no-hover bradius">
                            <div className="img-bg" style={{ backgroundImage: `url('${d.path}')` }}></div>
                          </div>
                        </div>
                      ): (<></>)}
                    </Fragment>
                  ))
                ): (<></>)}
              </div>
            </div>
          </div>
        </>
      ): (<></>)}

      {tabIndex === 1? (<MapProjectData mapProject={values} />): (<></>)}

      {tabIndex === 2? (
        <form onSubmit={onSubmitPermissions}>
          <div className="app-card p-0 mt-4">
            <div className="app-card-block">
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ minWidth: 140, width: '100%' }}>User</th>
                      <th style={{ minWidth: 100 }} className="text-center">Read</th>
                      <th style={{ minWidth: 100 }} className="text-center">Create</th>
                      <th style={{ minWidth: 100 }} className="text-center">Update</th>
                      <th style={{ minWidth: 100 }} className="text-center">Delete</th>
                      <th style={{ minWidth: 100 }} className="text-center">
                        <div onClick={onAddPermission} className="btn btn-action btn-p btn-xxs ml-2">
                          <em className="fa-solid fa-plus mr-1"></em> Add
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.map((d, i) => (
                      <tr key={`permission_${i}`}>
                        <td>
                          <div className="form-control">
                            <select 
                              required={false} 
                              value={d.userId? Number(d.userId): ''} 
                              onChange={e => onChangePermission(i, 'userId', e.target.value? Number(e.target.value): '')} 
                            >
                              <option value=""></option>
                              {thisUserList(d.userId? Number(d.userId): '').map((k, j) => (
                                <option key={`user_${i}_${j}`} value={k._id}>
                                  {k.displayName()}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        {['read', 'create', 'update', 'delete'].map((k, j) => (
                          <td key={`permission_${i}_${j}`} className="text-center">
                            {k === 'read'? (
                              <input 
                                type="checkbox" className="table-checkbox" 
                                value={1} disabled={false} 
                                checked={d[k]? true: false} 
                                onChange={e => onChangePermission(i, k, e.target.checked? 1: 0)} 
                              />
                            ): (
                              <input type="checkbox" className="table-checkbox" disabled={true} />
                            )}
                          </td>
                        ))}
                        <td className="text-center">
                          {i > 0? (
                            <span onClick={() => onDeletePermission(i)} className="table-option color-danger">
                              <em className="fa-regular fa-trash-can"></em>
                            </span>
                          ): (<></>)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="app-card-block border-top-1 bcolor-fgray pt-0">
              <div className="btns">
                <button type="submit" className="btn btn-action btn-p">
                  Save
                </button>
              </div>
            </div>
          </div>
        </form>
      ): (<></>)}
      
      <Footer />
    </div>
  );
}

MapProjectViewPage.defaultProps = {
	
};
MapProjectViewPage.propTypes = {
  setSidenavActiveIndex: PropTypes.func.isRequired,
	processList: PropTypes.func.isRequired,
	processRead: PropTypes.func.isRequired,
  processUpdate: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  
});

export default connect(mapStateToProps, {
  setSidenavActiveIndex: setSidenavActiveIndex,
  processList: processList,
  processRead: processRead,
  processUpdate: processUpdate,
})(MapProjectViewPage);