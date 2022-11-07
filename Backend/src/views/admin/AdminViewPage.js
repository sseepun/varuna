import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { onMounted } from '../../helpers/frontend';
import Breadcrumb from '../../components/Breadcrumb';
import Footer from '../../components/Footer';

import { connect } from 'react-redux';
import { setSidenavActiveIndex } from '../../actions/app.actions';
import { processRead, processUpdate } from '../../actions/admin.actions';
import { UserModel, AddressModel, UserPermissionModel } from '../../models';


function AdminViewPage(props) {
  const user = new UserModel(props.user);
  const history = useNavigate();
  const params = useParams();
  const process = params.process? params.process: 'view';
  const dataId = params.dataId? params.dataId: null;

  const [values, setValues] = useState(new UserModel({ status: 1 }));
  const [address, setAddress] = useState(new AddressModel({}));
  
  const [tabIndex, setTabIndex] = useState(0);
  const onChangeTabIndex = (e, i) => {
    e.preventDefault();
    setTabIndex(i);
  };


  // START: Permission
  const permissionList = [
    { name: 'Partner Shop Report', value: 'report_partner_shops' },
    { name: 'Partner Commission Report', value: 'report_partner_commissions' },
    { name: 'Partner Coupon Report', value: 'report_partner_coupons' },
    { name: 'Customer Order Report', value: 'report_customer_orders' },
    { name: 'Customer Settlement Report', value: 'report_customer_settlements' },
  ];
  const [permission, setPermission] = useState(new UserPermissionModel({}));

  const permissionValue = (val, type) => {
    if(values.isValid() && permission.isValid()){
      if(values.isSuperAdmin()) return true;
      else{
        let temp = permission.permissions.filter(d => d.type === 'C2U' && d.value === val);
        if(temp.length) return temp[0][type];
        else return false;
      }
    }else{
      return false;
    }
  };
  const onChangePermission = (val, type, c) => {
    if(values.isValid() && permission.isValid()){
      let p = [ ...permission.permissions ];
      let t = p.filter(d => d.type === 'C2U' && d.value === val);
      if(t.length){
        t[0][type] = c? 1: 0;
      }else{
        let n = { type: 'C2U', value: val, read: 0, create: 0, update: 0, delete: 0 };
        n[type] = c? 1: 0;
        p.push(n);
      }
      setPermission(new UserPermissionModel({ ...permission, permissions: p }));
    }
  };
  const onSubmitPermission = async (e) => {
    e.preventDefault();
    if(true){
      await props.processUpdate('user-permission', {
        userId: dataId,
        permissions: permission.permissions
      }, true);
    }
  };
  // END: Permission

  
  /* eslint-disable */
	useEffect(() => { onMounted(); props.setSidenavActiveIndex(2); }, []);
	useEffect(() => {
    setValues(new UserModel({ status: 1 }));
    setAddress(new AddressModel({}));
    setPermission(new UserPermissionModel({}));
    props.processRead('user', { _id: dataId, isAdmin: 1 }, true).then(d => {
      setValues(d);
      setAddress(d.address);
      props.processRead('user-permission', { userId: dataId }, true).then(k => {
        if(k) setPermission(new UserPermissionModel(k));
      });
    }).catch(() => history('/admin/admins'));
  }, []);
  /* eslint-enable */

  return (
    <>
      <div className="app-container">
        <Breadcrumb 
          title={`${process} Admin`} 
          structure={[
            { title: 'Admin', to: '/admin' },
            { title: 'Admin Management', to: '/admin/admins' }
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
                <p className="fw-500 op-60">ตำแหน่ง : {values.displayRole()}</p>
                <div className="btns mt-2">
                  {user.isSuperAdmin() && !values.isSuperAdmin()? (
                    <Link to={`/admin/admin/update/${dataId}`} className="btn btn-action btn-p btn-xs">
                      <em className="fa-regular fa-pen-to-square mr-1"></em> แก้ไขข้อมูล
                    </Link>
                  ): (<></>)}
                  <Link to="/admin/admins" className="btn btn-action btn-default btn-xs">
                    ย้อนกลับ
                  </Link>
                </div>
              </div>
            ): (<></>)}
          </div>
        </div>
        {user.isSuperAdmin()? (
          <div className="app-card tabs-02 p-0 mt-4">
            {['ข้อมูลทั่วไป', 'สิทธิการเข้าถึง'].map((d, i) => (
              <div 
                key={`tab_${i}`} onClick={e => onChangeTabIndex(e, i)} 
                className={`tab ${tabIndex===i? 'active': ''}`} 
              >
                <p className="lg fw-600 text-center">{d}</p>
              </div>
            ))}
          </div>
        ): (<></>)}
        
        {tabIndex === 0? (
          <>
            <div className="app-card p-0 mt-4">
              <div className="app-card-block">
                <p className="lg fw-800">ข้อมูลบัญชีผู้ใช้</p>
                <div className="ss-sep-01 mt-3"></div>
                <div className="grids">
                  <div className="grid lg-40 md-50 sm-100">
                    <span className="fw-700">ชื่อ-นามสกุล :</span> {values.displayName()}
                  </div>
                  <div className="grid lg-40 md-50 sm-100">
                    <span className="fw-700">ชื่อผู้ใช้ :</span> {values.username}
                  </div>
                  <div className="sep"></div>
                  <div className="grid lg-40 md-50 sm-100">
                    <span className="fw-700">อีเมล :</span> {values.email}
                  </div>
                  <div className="grid lg-40 md-50 sm-100">
                    <span className="fw-700">สถานะ :</span> {values.displayStatus()}
                  </div>
                </div>
              </div>
            </div>
            <div className="app-card p-0 mt-4">
              <div className="app-card-block">
                <p className="lg fw-800">ข้อมูลติดต่อ</p>
                <div className="ss-sep-01 mt-3"></div>
                <div className="grids">
                  <div className="grid lg-40 md-50 sm-100">
                    <span className="fw-700">เบอร์โทรศัพท์ :</span> {address.telephone? address.telephone: '-'}
                  </div>
                  <div className="sep"></div>
                  <div className="grid lg-80 md-100 sm-100">
                    <span className="fw-700">ที่อยู่ :</span> {address.address? address.address: '-'}
                  </div>
                  <div className="sep"></div>
                  <div className="grid lg-40 md-50 sm-100">
                    <span className="fw-700">{address.prefixSubdistrict()} :</span> {address.subdistrict? address.subdistrict: '-'}
                  </div>
                  <div className="grid lg-40 md-50 sm-100">
                    <span className="fw-700">{address.prefixDistrict()} :</span> {address.district? address.district: '-'}
                  </div>
                  <div className="sep"></div>
                  <div className="grid lg-40 md-50 sm-100">
                    <span className="fw-700">จังหวัด :</span> {address.province? address.province: '-'}
                  </div>
                  <div className="grid lg-40 md-50 sm-100">
                    <span className="fw-700">รหัสไปรษณีย์ :</span> {address.zipcode? address.zipcode: '-'}
                  </div>
                </div>
              </div>
            </div>
          </>
        ): (<></>)}

        {tabIndex === 1 && user.isSuperAdmin()? (
          <form onSubmit={onSubmitPermission}>
            <div className="app-card p-0 mt-4">
              <div className="app-card-block">
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th style={{ minWidth: 140, width: '100%' }}>โมดูล</th>
                        <th style={{ minWidth: 110 }} className="text-center">อ่าน</th>
                        <th style={{ minWidth: 110 }} className="text-center">สร้าง</th>
                        <th style={{ minWidth: 110 }} className="text-center">แก้ไข</th>
                        <th style={{ minWidth: 110 }} className="text-center">ลบ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {permissionList.map((d, i) => (
                        <tr key={`permission_${i}`}>
                          <td>{d.name}</td>
                          {['read', 'create', 'update', 'delete'].map((k, j) => (
                            <td key={`permission_${i}_${j}`} className="text-center">
                              {k === 'read'? (
                                <input 
                                  type="checkbox" className="table-checkbox" value={1} 
                                  disabled={!user.isSuperAdmin() || values.isSuperAdmin()} 
                                  defaultChecked={permissionValue(d.value, k)} 
                                  onChange={e => onChangePermission(d.value, k, e.target.checked)} 
                                />
                              ): (
                                <input type="checkbox" className="table-checkbox" disabled={true} />
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="app-card-block border-top-1 bcolor-fgray pt-0">
                <div className="btns">
                  <button type="submit" className="btn btn-action btn-p">
                    บันทึกข้อมูล
                  </button>
                </div>
              </div>
            </div>
          </form>
        ): (<></>)}

        <Footer />
      </div>
    </>
  );
}

AdminViewPage.defaultProps = {
	
};
AdminViewPage.propTypes = {
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
})(AdminViewPage);