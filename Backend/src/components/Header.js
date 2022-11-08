import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { appLogo, appName } from '../helpers/frontend';

import { connect } from 'react-redux';
import { userSignout, userPermission } from '../actions/user.actions';
import { UserModel } from '../models';


function Header(props) {
	const user = new UserModel(props.user);
  
  const location = useLocation();
	const [currentPath, setCurrentPath] = useState('/');
  
  // START: Menu
	const [menu, setMenu] = useState([]);
	const [menuToggle, setMenuToggle] = useState([]);
  const onMenuToggle = (e, i) => {
    e.preventDefault();
    let temp = [...menuToggle];
    temp[i] = !temp[i];
    setMenuToggle(temp);
  };
  
	const [sidenavActive, setSidenavActive] = useState(false);
  const onSidenavActiveToggle = (e) => {
    e.preventDefault();
    setSidenavActive(!sidenavActive);
  };
  // END: Menu

  
	const onSignout = async (e) => {
    e.preventDefault();
		await props.processSignout();
    window.location.href = '/';
	};


  /* eslint-disable */
	useEffect(() => {
    if(currentPath !== location.pathname){
      setCurrentPath(location.pathname);
      setSidenavActive(false);
      setMenuToggle(menu.map(() => false));
    }
  }, [location.pathname]);

	useEffect(() => {
    async function onFetch() {
      let temp = [];
      let u = new UserModel(props.user);
      if(u.isSignedIn()){
        let permissions = await props.userPermission();
        if(u.isAdmin()){
          temp = [
            {
              title: 'Admin',
              activeIndexes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
              children: [
                { title: 'Dashboard', to: '/admin', activeIndex: 1, icon: 'fa-solid fa-chart-simple' },
                { title: 'Admins', to: '/admin/admins', activeIndex: 2, icon: 'fa-solid fa-users' },
                { title: 'Sales Managers', to: '/admin/sales-managers', activeIndex: 3, icon: 'fa-solid fa-people-group' },
                { title: 'Shipping Statuses', to: '/admin/shipping-statuses', activeIndex: 4, icon: 'fa-solid fa-truck-ramp-box' },
              ]
            }, {
              title: 'Partner',
              activeIndexes: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
              children: [
                { title: 'Partners', to: '/admin/partners', activeIndex: 21, icon: 'fa-solid fa-users' },
                { title: 'Partner Shops', to: '/admin/partner-shops', activeIndex: 22, icon: 'fa-solid fa-shop' },
                { title: 'Product Categories', to: '/admin/partner-product-categories', activeIndex: 23, icon: 'fa-solid fa-box' },
                { title: 'Product Brands', to: '/admin/partner-product-brands', activeIndex: 24, icon: 'fa-solid fa-star' },
                { title: 'Products', to: '/admin/partner-products', activeIndex: 25, icon: 'fa-solid fa-basket-shopping' },
                { title: 'Product Coupons', to: '/admin/partner-product-coupons', activeIndex: 26, icon: 'fa-solid fa-tags' },
                { title: 'Shipping Methods', to: '/admin/partner-shippings', activeIndex: 27, icon: 'fa-solid fa-truck-ramp-box' },
                { title: 'Shipping Coupons', to: '/admin/partner-shipping-coupons', activeIndex: 28, icon: 'fa-solid fa-tags' },
              ]
            }, {
              title: 'Customer',
              activeIndexes: [41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60],
              children: [
                { title: 'Customer Tiers', to: '/admin/customer-tiers', activeIndex: 41, icon: 'fa-solid fa-crown' },
                { title: 'Customers', to: '/admin/customers', activeIndex: 42, icon: 'fa-solid fa-users' },
                { title: 'Guest Accounts', to: '/admin/customer-guests', activeIndex: 46, icon: 'fa-solid fa-users' },
                { title: 'Orders', to: '/admin/customer-orders', activeIndex: 43, icon: 'fa-solid fa-credit-card' },
                { title: 'Messages', to: '/admin/customer-messages', activeIndex: 44, icon: 'fa-solid fa-message' },
                { title: 'Notifications', to: '/admin/customer-notifications', activeIndex: 45, icon: 'fa-solid fa-bullhorn' }
              ]
            }, {
              title: 'Seller',
              activeIndexes: [61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80],
              children: [
                { title: 'Seller Shop Types', to: '/admin/seller-shop-types', activeIndex: 61, icon: 'fa-solid fa-crown' },
                { title: 'Seller Shops', to: '/admin/seller-shops', activeIndex: 63, icon: 'fa-solid fa-shop' },
              ]
            }, {
              title: 'Business Report',
              activeIndexes: [101, 102, 103, 104, 105, 106, 107, 108, 109, 110],
              children: []
            }, {
              title: 'Content Management',
              activeIndexes: [111, 112, 113, 114, 115, 116, 117, 118, 119, 120],
              children: [
                { title: 'Content Categories', to: '/admin/cms-content-categories', activeIndex: 111, icon: 'fa-solid fa-layer-group' },
                { title: 'Contents', to: '/admin/cms-contents', activeIndex: 112, icon: 'fa-solid fa-book-open' },
                { title: 'Banners', to: '/admin/cms-banners', activeIndex: 113, icon: 'fa-solid fa-star' },
                { title: 'Popups', to: '/admin/cms-popups', activeIndex: 114, icon: 'fa-solid fa-clipboard' },
              ]
            }
          ];
          if(u.isSuperAdmin()){
            temp[0]['children'].push({ title: 'Settings', to: '/admin/settings', activeIndex: 5, icon: 'fa-solid fa-gear' });
            temp[1]['children'].push({ title: 'Settings', to: '/admin/partner-settings', activeIndex: 29, icon: 'fa-solid fa-gear' });
            temp[5]['children'].push({ title: 'Settings', to: '/admin/cms-settings', activeIndex: 115, icon: 'fa-solid fa-gear' });
          }
          [{
            title: 'Partner Shops', to: '/admin/report-partner-shops',
            activeIndex: 101, icon: 'fa-solid fa-chart-column',
            value: 'report_partner_shops'
          }, {
            title: 'Partner Commissions', to: '/admin/report-partner-commissions',
            activeIndex: 102, icon: 'fa-solid fa-chart-column',
            value: 'report_partner_commissions'
          }, {
            title: 'Partner Coupons', to: '/admin/report-partner-coupons',
            activeIndex: 103, icon: 'fa-solid fa-chart-column',
            value: 'report_partner_coupons'
          }, {
            title: 'Customer Orders', to: '/admin/report-customer-orders',
            activeIndex: 104, icon: 'fa-solid fa-chart-column',
            value: 'report_customer_orders'
          }, {
            title: 'Customer Settlements', to: '/admin/report-customer-settlements',
            activeIndex: 105, icon: 'fa-solid fa-chart-column',
            value: 'report_customer_settlements'
          }].forEach(d => {
            if(u.isSuperAdmin()) temp[4]['children'].push(d);
            else{
              let t = permissions.filter(k => k.read === 1 && k.type === 'C2U' && k.value === d.value);
              if(t.length) temp[4]['children'].push(d);
            }
          });
        }else if(u.isUser()){
          
        }
      }
      setMenu(temp);
      setMenuToggle(temp.map(() => false));
    };
    onFetch();
  }, [props.user]);
  /* eslint-enable */

  return !user.isSignedIn()? (<></>): (
    ( currentPath.indexOf('/admin') > -1 && user.isAdmin() ) 
    || ( currentPath.indexOf('/partner') > -1 && user.isPartner() )
    || ( currentPath.indexOf('/sales-manager') > -1 && user.isSalesManager() )? (
      <>
        {/* Topnav */}
        <nav className="topnav bcolor-fgray">
          <div className="wrapper">
            <Link to={user.path()} className="logo-container h-color-p">
              <img className="logo" src={appLogo()} alt="Logo" />
              <div className="text fw-900">{appName()}</div>
            </Link>
            <div className="sidenav-toggle" onClick={onSidenavActiveToggle}>
              <div className={`hamburger ${sidenavActive? 'active': ''}`}>
                <div></div><div></div><div></div>
              </div>
            </div>
  
            <div className="options">
  
              {/* Profile */}
              <div className="option">
                <div className="option-icon">
                  <div className="avatar xs">
                    <div className="avatar-bg" style={{ backgroundImage: `url('${user.avatar.path}')` }}></div>
                  </div>
                </div>
                <div className="dropdown bcolor-fgray">
                  <div className="wrapper bcolor-fgray">
                    <h6 className="name">{user.displayName()}</h6>
                    <p className="role color-gray">ตำแหน่ง : {user.displayRole()}</p>
                  </div>
                  <div className="wrapper bcolor-fgray">
                    <Link to={`${user.path()}/profile`} className="dropdown-item">
                      <div className="icon"><em className="fa-solid fa-user"></em></div>
                      ข้อมูลส่วนตัว
                    </Link>
                    <div className="dropdown-item c-pointer" onClick={onSignout}>
                      <div className="icon"><em className="fa-solid fa-right-to-bracket"></em></div>
                      ออกจากระบบ
                    </div>
                  </div>
                </div>
              </div>
  
            </div>
          </div>
        </nav>
  
        {/* Sidenav */}
        <nav className={`sidenav ${sidenavActive? 'active': ''}`}>
          <ul className="wrapper">
            {menu.map((d, i) => (
              <div 
                key={`menu_${i}`} 
                className={`menu-set ${d.activeIndexes.indexOf(props.sidenavActiveIndex)>-1 || menuToggle[i]? 'active': ''}`} 
              >
                {d.to? (
                  <Link className="menu-header" to={d.to}>
                    {d.title}
                  </Link>
                ): (
                  <div className="menu-header" onClick={e => onMenuToggle(e, i)}>
                    {d.title}
                    {d.children && d.children.length? (
                      <div className="chev"><em className="fa-solid fa-chevron-right"></em></div>
                    ): (<></>)}
                  </div>
                )}
                {d.children && d.children.length? (
                  <div className="menu-container">
                    {d.children.map((k, j) => (
                    <Link 
                      to={k.to} key={`submenu_${i}_${j}`} 
                      className={`menu ${props.sidenavActiveIndex===k.activeIndex? 'active': ''}`} 
                    >
                      <div className="icon"><em className={k.icon}></em></div>
                      <span className="label">{k.title}</span>
                    </Link>
                    ))}
                  </div>
                ): (<></>)}
              </div>
            ))}
          </ul>
        </nav>
      </>
    ): (<></>)
  );
}

Header.defaultProps = {
  
};
Header.propTypes = {
	user: PropTypes.object.isRequired,
  processSignout: PropTypes.func.isRequired,
  userPermission: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  sidenavActiveIndex: state.app.sidenavActiveIndex,
	user: state.user.user,
  notiCustomerOrders: state.app.notiCustomerOrders
});

export default connect(mapStateToProps, {
  processSignout: userSignout,
  userPermission: userPermission,
})(Header);