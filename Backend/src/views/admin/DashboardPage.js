import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { onMounted } from '../../helpers/frontend';
import Breadcrumb from '../../components/Breadcrumb';
import Footer from '../../components/Footer';

import { connect } from 'react-redux';
import { setSidenavActiveIndex } from '../../actions/app.actions';
import { processList } from '../../actions/admin.actions';

function DashboardPage(props) {
  /* eslint-disable */
	useEffect(() => { onMounted(); props.setSidenavActiveIndex(1); }, []);
  /* eslint-enable */

  return (
    <div className="app-container">
      <Breadcrumb 
        title="แดชบอร์ด" 
        structure={[
          { title: 'สำหรับผู้ดูแลระบบ', to: '/admin' },
          { title: 'แดชบอร์ด', to: '/admin' }
        ]}
      />

      <Footer />
    </div>
  );
}

DashboardPage.defaultProps = {
	
};
DashboardPage.propTypes = {
	setSidenavActiveIndex: PropTypes.func.isRequired,
  processList: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  
});

export default connect(mapStateToProps, {
  setSidenavActiveIndex: setSidenavActiveIndex,
  processList: processList,
})(DashboardPage);