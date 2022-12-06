import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { onMounted } from '../../helpers/frontend';
import Breadcrumb from '../../components/Breadcrumb';
import Footer from '../../components/Footer';

import Map, { Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import { connect } from 'react-redux';
import { setSidenavActiveIndex } from '../../actions/app.actions';
import { processList } from '../../actions/admin.actions';
import { MAPBOX_KEY } from '../../actions/variables';


function DashboardPage(props) {
  const [dataFilter, setDataFilter] = useState({ mapStyle: 'satellite-v9' });
  const onChangeDataFilter = (key, val, isNumber=false) => {
    if(isNumber) val = val || val===0? Number(val): '';
    setDataFilter({ ...dataFilter, [key]: val });
  };
  
  const parkLayer = {
    id: 'landuse_park',
    type: 'fill',
    source: 'mapbox',
    'source-layer': 'landuse',
    filter: ['==', 'class', 'park'],
    paint: {
      'fill-color': '#4E3FC8'
    }
  };

  /* eslint-disable */
	useEffect(() => { onMounted(); props.setSidenavActiveIndex(1); }, []);
  /* eslint-enable */

  return (
    <div className="app-container">
      <Breadcrumb 
        title="Dashboard" 
        structure={[
          { title: 'Admin', to: '/admin' },
          { title: 'Dashboard', to: '/admin' }
        ]}
      />
      <div className="grids">
        <div className="grid sm-100">
          <div className="app-card pt-0">
            <div className="grids">
              <div className="grid sm-50 md-25 lg-25">
                <div className="form-group">
                  <select 
                    value={dataFilter.mapStyle? dataFilter.mapStyle: ''} 
                    onChange={e => onChangeDataFilter('mapStyle', e.target.value)} 
                  >
                    <option value="satellite-v9">Satellite</option>
                    <option value="light-v10">Light</option>
                    <option value="dark-v10">Dark</option>
                    <option value="streets-v11">Streets</option>
                    <option value="outdoors-v11">Outdoors</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid sm-100">
          <div className="app-card p-0 h-full ovf-hidden">
            <Map
              initialViewState={{
                longitude: 100.5018,
                latitude: 13.7563,
                zoom: 14
              }} 
              style={{ width: '100%', height: 'calc(100vh - 20rem)' }} 
              mapStyle={`mapbox://styles/mapbox/${dataFilter.mapStyle}`} 
              mapboxAccessToken={MAPBOX_KEY} 
            >
              <Layer {...parkLayer} />
            </Map>
          </div>
        </div>
      </div>

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