import PropTypes from 'prop-types';
import { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { onMounted, formatNumber } from '../../helpers/frontend';
import Breadcrumb from '../../components/Breadcrumb';
import Footer from '../../components/Footer';

import * as turf from '@turf/turf';
import Map, { Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import ReactECharts from 'echarts-for-react';

import { connect } from 'react-redux';
import { setSidenavActiveIndex } from '../../actions/app.actions';
import { processClear, processList } from '../../actions/admin.actions';
import { MapProjectModel, MapDataModel, MapLayerModel } from '../../models';
import { MAPBOX_KEY } from '../../actions/variables';

function DashboardPage(props) {
  const [project, setProject] = useState(new MapProjectModel({}));
  const [mapDatas, setMapDatas] = useState([]);

  const [mapData, setMapData] = useState(new MapDataModel({}));
  const [geoData, setGeoData] = useState(null);
  const [displayData, setDisplayData] = useState(null);
  const [mapCenter, setMapCenter] = useState([100.5018, 13.7563]);

  const [selectedRow, setSelectedRow] = useState(-1);
  const [mainLayer, setMainLayer] = useState(new MapLayerModel({}));
  const [layers, setLayers] = useState([]);

  const onChangeProject = async (e=null, d=null) => {
    if(e) e.preventDefault();
    setMapDatas([]);
    setSelectedRow(-1);
    if(d){
      let res = await props.processList('map-datas', {
        dataFilter: { mapProjectId: d._id, status: 1 }
      }, true);
      if(res && res.result && res.result.length){
        setMapDatas(res.result);
        await onChangeMapData(res.result[0]._id, res.result[0]);
      }
      setProject(d);
    }else{
      setProject(new MapProjectModel({}));
    }
  };

  const onChangeMapData = async (val=null, d=null) => {
    setMapData(new MapDataModel({}));
    setGeoData(null);
    setDisplayData(null);
    setMapCenter([100.5018, 13.7563]);
    setSelectedRow(-1);
    if(val){
      let temp = d? [d]: mapDatas.filter(k => k._id === Number(val));
      if(temp.length){
        temp = temp[0];
        let temp2 = await temp.getData();
        let temp3 = turf.center(temp2);
        
        setMapData(temp);
        setGeoData(temp2);
        setDisplayData(temp2);
        setMapCenter(temp3.geometry.coordinates);

        let temp4 = [ ...props.layers ].map(d => {
          d.initData(temp2);
          return d;
        });
        setLayers(temp4);
      }
    }
  };
  
  const onFilterMapData = (e=null, i=-1, feature=null) => {
    if(e) e.preventDefault();
    if(!feature){
      selectedRow(-1);
      setDisplayData(geoData);
    }else{
      if(i === selectedRow){
        setSelectedRow(-1);
        setDisplayData(geoData);
        let center = turf.center(geoData);
        setMapCenter(center.geometry.coordinates);
      }else{
        setSelectedRow(i);
        let temp = { ...geoData };
        temp.features = [ feature ];
        setDisplayData(temp);
        let center = turf.center(temp);
        setMapCenter(center.geometry.coordinates);
      }
    }
  };

  /* eslint-disable */
	useEffect(() => { onMounted(); props.setSidenavActiveIndex(1); }, []);
	useEffect(() => {
    const loadData = async () => {
      props.processClear('map-projects');
      props.processClear('map-layers');
      let res = await props.processList('map-projects', { dataFilter: { status: 1 } }, true);
      if(res && res.result && res.result.length){
        await props.processList('map-layers', { dataFilter: { status: 1 } }, true);
      }
    };
    loadData();
  }, []);
	useEffect(() => {
    let temp = props.layers.filter(d => d.isDeletable === 0);
    if(temp.length) setMainLayer(temp[0]);
  }, [props.layers]);
  /* eslint-enable */

  return (
    <div className="app-container">

      {!project.isValid()? (
        <>
          <Breadcrumb 
            title="แดชบอร์ด" 
            structure={[
              { title: 'สำหรับผู้ดูแลระบบ', to: '/admin' },
              { title: 'แดชบอร์ด', to: '/admin' }
            ]}
          />
          <div className="grids">
            {props.list.map((d, i) => (
              <div className="grid xl-25 md-1-3" key={`project_${i}`}>
                <div 
                  className="ss-card bg-white bradius ovf-hidden c-pointer" 
                  onClick={e => onChangeProject(e, d)} 
                >
                  <div className="ss-img">
                    <div className="img-bg" style={{ backgroundImage: `url('${d.image.path}')` }}></div>
                  </div>
                  <div className="text-container p-4">
                    <h6 className="title fw-600">{d.name}</h6>
                    {d.description? (
                      <p className="desc xs mt-1">{d.description}</p>
                    ): (<></>)}
                  </div>
                </div>
              </div>
            ))}
            <div className="grid xl-25 md-1-3">
              <Link 
                to="/admin/map-project/create" 
                className="ss-card ss-card-02 bradius c-pointer" 
              >
                <div className="wrapper">
                  <div className="icon">
                    <em className="fa-solid fa-plus"></em>
                  </div>
                  <p className="fw-500">สร้างโครงการแผนที่</p>
                </div>
              </Link>
            </div>
          </div>
        </>
      ): (
        <>
          <div className="app-card">
            <div className="breadcrumb">
              <div className="d-flex ai-center">
                <div className="icon c-pointer mr-3" onClick={onChangeProject}>
                  <em className="fa-solid fa-arrow-left"></em>
                </div>
                <h6 className="title fw-800 lh-sm">{project.name}</h6>
              </div>
              <div className="structure color-gray">
                <Link className="h-color-p" to="/admin">สำหรับผู้ดูแลระบบ</Link>
                <div className="ml-1 mr-1">/</div> 
                <div className="color-p">แดชบอร์ด</div>
              </div>
            </div>
          </div>
          {!mapData.isValid()? (
            <div>No Data</div>
          ): (
            <div className="map-dashboard" key={`${mapData._id}`}>
              <div className="grids">
  
                <div className="grid lg-2-3 sm-100">
                  <div className="map-widget ovf-hidden bg-white bradius">
                    <div className="map-wrapper">
                      {geoData? (
                        <Map 
                          initialViewState={{
                            longitude: mapCenter[0],
                            latitude: mapCenter[1],
                            zoom: 11.75,
                          }} 
                          style={{ width: '100%', height: '100%' }} 
                          // mapStyle={`mapbox://styles/mapbox/${mapStyle}`} 
                          mapStyle={`mapbox://styles/mapbox/satellite-v9`} 
                          mapboxAccessToken={MAPBOX_KEY} 
                          interactiveLayerIds={[ 'data' ]} 
                        >
                          <Source type="geojson" data={displayData}>
                            {mainLayer.isValid()? (
                              <Layer 
                                {...{
                                  id: 'data',
                                  type: 'fill',
                                  paint: {
                                    'fill-color': mainLayer.color,
                                    'fill-opacity': mainLayer.opacity/100,
                                  }
                                }}
                              />
                            ): (<></>)}
                          </Source>
                        </Map>
                      ): (<></>)}
                    </div>
                    <div className="options">
                      <div className="form-group">
                        <select 
                          value={mapData.isValid()? mapData._id: ''} 
                          onChange={e => onChangeMapData(e.target.value)} 
                        >
                          {mapDatas.map((d, i) => (
                            <option key={`md_${i}`} value={d._id}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
  
                {layers.map((layer, layerI) => (
                  <Fragment key={`layer_${layerI}`}>
                    {layer.type === 1? (
                      <div className="grid lg-1-3 sm-100">
                        <div className="table-widget bg-white bradius">
                          <div className="wrapper">
                            <table className="table header-sticky">
                              <thead>
                                <tr>
                                  <th style={{ width: '3rem' }} className="text-center">ID</th>
                                  {layer.attributes.map((d, i) => (
                                    <th key={`th_${i}`} className="ws-nowrap">
                                      {d.name} {d.unit? (<>({d.unit})</>): (<></>)}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {!geoData.features || !geoData.features.length? (
                                  <tr>
                                    <td 
                                      colSpan={layer.attributes.length+1} 
                                      className="text-center" 
                                    >
                                      ไม่มีข้อมูล
                                    </td>
                                  </tr>
                                ): (
                                  geoData.features.map((d, i) => (
                                    <tr 
                                      key={`row_${i}`} 
                                      className={`c-pointer ${i === selectedRow? 'row-active': ''}`} 
                                      onClick={e => onFilterMapData(e, i, d)} 
                                    >
                                      <td className="text-center">{i+1}</td>
                                      {layer.attributes.map((k, j) => (
                                        <td key={`col_${i}_${j}`} className="ws-nowrap">
                                          {k.dataType === 2
                                            ? (formatNumber(d.properties[k.key], k.digits? k.digits: 0))
                                            : (d.properties[k.key])}
                                        </td>
                                      ))}
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    ): layer.type === 2? (
                      <div className="grid sm-100">
                        <div className="chart-widget bg-white bradius">
                          <div className="p-4 border-bottom-1 bcolor-fgray">
                            <h6 className="fw-700 text-center">{layer.name}</h6>
                          </div>
                          <div className="chart-body">
                            <div className="label-y">
                              <p className="sm fw-400">
                                {layer.chartAxisY && layer.chartAxisY.name 
                                  ? layer.chartAxisY.name: ''}
                              </p>
                            </div>
                            <div className="wrapper">
                              <ReactECharts 
                                option={{
                                  grid: { top: 12, right: 24, bottom: 20, left: 80 },
                                  xAxis: {
                                    data: layer.chartDataX,
                                    axisLine: {
                                      lineStyle: { color: 'rgb(227, 226, 236, 0.8)' }
                                    },
                                    axisLabel: { fontSize: 13, color: '#777777' }
                                  },
                                  yAxis: {
                                    max: layer.chartMaxY,
                                    splitLine: {
                                      lineStyle: { color: 'rgb(227, 226, 236, 0.8)' }
                                    },
                                    axisLine: {
                                      lineStyle: { color: 'rgb(227, 226, 236, 0.8)' }
                                    },
                                    axisLabel: { fontSize: 10, color: '#777777' }
                                  },
                                  tooltip: {
                                    show: true,
                                    showContent: true,
                                    alwaysShowContent: false,
                                    triggerOn: 'mousemove',
                                    trigger: 'axis',
                                    axisPointer: {
                                      label: { show: false }
                                    }
                                  },
                                  series: [{
                                    type: 'bar',
                                    name: layer.chartAxisY && layer.chartAxisY.unit
                                      ? layer.chartAxisY.unit: '',
                                    data: layer.chartDataY
                                  }],
                                  color: [
                                    layer.chartAxisY && layer.chartAxisY.color
                                      ? layer.chartAxisY.color: ''
                                  ]
                                }} 
                              />
                            </div>
                            <div className="label-x">
                              <p className="sm fw-400">
                                {layer.chartAxisX && layer.chartAxisX.name 
                                  ? layer.chartAxisX.name: ''}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ): layer.type === 3? (
                      <div className="grid sm-100">
                        <div className="chart-widget horizontal bg-white bradius">
                          <div className="p-4 border-bottom-1 bcolor-fgray">
                            <h6 className="fw-700 text-center">{layer.name}</h6>
                          </div>
                          <div className="chart-body">
                            <div className="label-y">
                              <p className="sm fw-400">
                                {layer.chartAxisY && layer.chartAxisY.name 
                                  ? layer.chartAxisY.name: ''}
                              </p>
                            </div>
                            <div className="wrapper">
                              <ReactECharts 
                                option={{
                                  grid: { top: 12, right: 24, bottom: 20, left: 200 },
                                  yAxis: {
                                    data: layer.chartDataY,
                                    axisLine: {
                                      lineStyle: { color: 'rgb(227, 226, 236, 0.8)' }
                                    },
                                    axisLabel: { fontSize: 13, color: '#777777' }
                                  },
                                  xAxis: {
                                    max: layer.chartMaxX,
                                    splitLine: {
                                      lineStyle: { color: 'rgb(227, 226, 236, 0.8)' }
                                    },
                                    axisLine: {
                                      lineStyle: { color: 'rgb(227, 226, 236, 0.8)' }
                                    },
                                    axisLabel: { fontSize: 10, color: '#777777' }
                                  },
                                  tooltip: {
                                    show: true,
                                    showContent: true,
                                    alwaysShowContent: false,
                                    triggerOn: 'mousemove',
                                    trigger: 'axis',
                                    axisPointer: {
                                      label: { show: false }
                                    }
                                  },
                                  series: [{
                                    type: 'bar',
                                    name: layer.chartAxisX && layer.chartAxisX.unit
                                      ? layer.chartAxisX.unit: '',
                                    data: layer.chartDataX
                                  }],
                                  color: [
                                    layer.chartAxisX && layer.chartAxisX.color
                                      ? layer.chartAxisX.color: ''
                                  ]
                                }}
                              />
                            </div>
                            <div className="label-x">
                              <p className="sm fw-400">
                                {layer.chartAxisX && layer.chartAxisX.name 
                                  ? layer.chartAxisX.name: ''}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ): [4, 5].indexOf(layer.type) > -1? (
                      <div className="grid lg-1-3 sm-100">
                        <div className="pie-widget bg-white bradius">
                          <div className="p-4 border-bottom-1 bcolor-fgray">
                            <h6 className="fw-700 text-center">{layer.name}</h6>
                          </div>
                          <div className="chart-body">
                            <ReactECharts 
                              option={{
                                title: { text: '', subtext: '', x: 'center' },
                                tooltip: {
                                  trigger: 'item',
                                  formatter: (p => {
                                    return `${p.data.name} = ${formatNumber(p.percent)}%<br />
                                      ${formatNumber(p.data.value, p.data.digits)} ${p.data.unit}`;
                                  })
                                },
                                legend: {
                                  x: 'center', y: 'bottom',
                                  data: layer.attributes.map(d => d.name),
                                  textStyle: { color: '#555555' }
                                },
                                series: [{
                                  name: '', type: 'pie',
                                  radius: [layer.type === 5? 50: 0, 110],
                                  center: ['50%', '46%'],
                                  label: { show: false }, lableLine: { show: false },
                                  emphasis: {
                                    label: { show: false },
                                    lableLine: { show: false }
                                  },
                                  data: layer.attributes.map(d => {
                                    return {
                                      value: layer.getDataTotal(geoData, d),
                                      name: d.name,
                                      unit: d.unit,
                                      digits: d.digits? d.digits: 0,
                                    };
                                  }),
                                }],
                                color: layer.attributes.map(d => d.color),
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ): layer.type === 6? (
                      <div className="grid lg-1-3 sm-100">
                        <div className="total-widget bg-white bradius">
                          <div className="p-4 border-bottom-1 bcolor-fgray">
                            <h6 className="fw-700">{layer.name}</h6>
                          </div>
                          <div className="chart-body">
                            {layer.attributes.map((d, i) => (
                              <h4 key={`g6_${layer._id}_${i}`} 
                                className="fw-600 lh-xs" style={{ color: d.color }} 
                              >
                                {formatNumber(
                                  layer.getDataTotal(geoData, d), d.digits? d.digits: 0
                                )} {d.unit? (
                                  <span className="p fw-600 color-dark">{d.unit}</span>
                                ): (<></>)}
                              </h4>
                            ))}
                          </div>
                        </div>
                      </div>
                    ): (<></>)}
                  </Fragment>
                ))}
  
              </div>
            </div>
          )}
        </>
      )}

      <Footer />
    </div>
  );
}

DashboardPage.defaultProps = {
	
};
DashboardPage.propTypes = {
	setSidenavActiveIndex: PropTypes.func.isRequired,
  processClear: PropTypes.func.isRequired,
  processList: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  list: state.app.mapProjects,
  layers: state.app.mapLayers,
});

export default connect(mapStateToProps, {
  setSidenavActiveIndex: setSidenavActiveIndex,
  processClear: processClear,
  processList: processList,
})(DashboardPage);