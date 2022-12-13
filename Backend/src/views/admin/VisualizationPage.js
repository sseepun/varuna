import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { onMounted } from '../../helpers/frontend';
import Breadcrumb from '../../components/Breadcrumb';
import Footer from '../../components/Footer';

import { connect } from 'react-redux';
import { setSidenavActiveIndex } from '../../actions/app.actions';
import { processList } from '../../actions/admin.actions';

function VisualizationPage(props) {
  /* eslint-disable */
	useEffect(() => { onMounted(); props.setSidenavActiveIndex(23); }, []);
  /* eslint-enable */

  return (
    <div className="app-container">
      <Breadcrumb 
        title="การแสดงข้อมูลแผนที่" 
        structure={[
          { title: 'การจัดการข้อมูลแผนที่', to: '/admin' },
          { title: 'การแสดงข้อมูลแผนที่', to: '/admin/visualization' }
        ]}
      />

      <Footer />
    </div>
  );
}

VisualizationPage.defaultProps = {
	
};
VisualizationPage.propTypes = {
	setSidenavActiveIndex: PropTypes.func.isRequired,
  processList: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  
});

export default connect(mapStateToProps, {
  setSidenavActiveIndex: setSidenavActiveIndex,
  processList: processList,
})(VisualizationPage);