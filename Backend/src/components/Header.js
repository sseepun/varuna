import PropTypes from 'prop-types';
import { useState, useEffect, Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { appLogo } from '../helpers/frontend';

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
  
	const [collapseActive, setCollapseActive] = useState(false);
  const onCollapseActiveToggle = (e) => {
    e.preventDefault();
    setCollapseActive(!collapseActive);
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
        if(u.isAdmin()){
          temp = [
            {
              title: 'สำหรับผู้ดูแลระบบ',
              activeIndexes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
              children: [
                { title: 'แดชบอร์ด', to: '/admin', activeIndex: 1, icon: 'fa-solid fa-chart-simple' },
                { title: 'ผู้ดูแลระบบ', to: '/admin/admins', activeIndex: 2, icon: 'fa-solid fa-users' },
                { title: 'ผู้ใช้งานทั่วไป', to: '/admin/users', activeIndex: 3, icon: 'fa-solid fa-people-group' },
              ]
            }, {
              title: 'การจัดการข้อมูลแผนที่',
              activeIndexes: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
              children: [
                { title: 'เลเยอร์แผนที่', to: '/admin/map-layers', activeIndex: 21, icon: 'fa-solid fa-layer-group' },
                { title: 'โครงการแผนที่', to: '/admin/map-projects', activeIndex: 22, icon: 'fa-solid fa-map' },
              ]
            },
          ];
        }else if(u.isUser()){
          temp = [
            {
              title: 'สำหรับผู้ใช้งาน',
              activeIndexes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
              children: [
                { title: 'ข้อมูลแผนที่', to: '/user', activeIndex: 1, icon: 'fa-solid fa-chart-simple' },
                { title: 'ข้อมูลส่วนตัว', to: '/user/profile', activeIndex: 2, icon: 'fa-solid fa-user' },
                { title: 'ออกจากระบบ', isSignout: 1, icon: 'fa-solid fa-right-to-bracket' },
              ]
            },
          ];
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
    || ( currentPath.indexOf('/user') > -1 && user.isUser() )? (
      <>
        {/* Topnav */}
        <nav className={`topnav bcolor-fgray ${collapseActive? 'collapse': ''}`}>
          <div className="wrapper">
            <Link to={user.path()} className="logo-container h-color-p">
              <img className="logo" src={appLogo()} alt="Logo" />
              <div className="text text-white">
                <img src={'/assets/img/text-white.png'} alt="Logo Text" />
              </div>
              <div className="text text-dark">
                <img src={'/assets/img/text-dark.png'} alt="Logo Text" />
              </div>
            </Link>
            <div className="collapse-toggle" onClick={onCollapseActiveToggle}>
              <div className={`wrapper ${collapseActive? 'active': ''}`}>
                <em className="fa-solid fa-arrow-right"></em>
              </div>
            </div>
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
        <nav className={`sidenav ${sidenavActive? 'active': ''} ${collapseActive? 'collapse': ''}`}>
          <ul className="wrapper">
            {menu.map((d, i) => (
              <div 
                key={`menu_${i}`} 
                className={`menu-set ${d.activeIndexes.indexOf(props.sidenavActiveIndex)>-1 || menuToggle[i]? 'active': ''}`} 
              >
                {d.to? (
                  <Link className="menu-header" to={d.to}>
                    <div className="leading">{d.title.charAt(0)}</div>
                    <div className="full">{d.title}</div>
                  </Link>
                ): (
                  <div className="menu-header" onClick={e => onMenuToggle(e, i)}>
                    <div className="leading">{d.title.charAt(0)}</div>
                    <div className="full">{d.title}</div>
                    {false && d.children && d.children.length? (
                      <div className="chev"><em className="fa-solid fa--right"></em></div>
                    ): (<></>)}
                  </div>
                )}
                {d.children && d.children.length? (
                  <div className="menu-container">
                    {d.children.map((k, j) => (
                      <Fragment key={`submenu_${i}_${j}`}>
                        {k.isSignout? (
                          <div className="menu c-pointer" onClick={onSignout}>
                            <div className="icon"><em className={k.icon}></em></div>
                            <span className="label">{k.title}</span>
                          </div>
                        ): (
                          <Link to={k.to} 
                            className={`menu ${props.sidenavActiveIndex===k.activeIndex? 'active': ''}`} 
                          >
                            <div className="icon"><em className={k.icon}></em></div>
                            <span className="label">{k.title}</span>
                          </Link>
                        )}
                      </Fragment>
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