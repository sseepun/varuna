import PropTypes from 'prop-types';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { onMounted, scrollToRef } from '../../helpers/frontend';
import Breadcrumb from '../../components/Breadcrumb';
import Pagination from '../../components/Pagination';
import Footer from '../../components/Footer';

import { connect } from 'react-redux';
import { setSidenavActiveIndex } from '../../actions/app.actions';
import { processClear, processList, processDelete } from '../../actions/admin.actions';
import { PaginateModel } from '../../models';


function MapLayersPage(props) {
  const tableRef = useRef(null);

  const [dataFilter, setDataFilter] = useState({ keywords: '', status: '' });
  const onChangeDataFilter = (key, val, isNumber=false) => {
    if(isNumber) val = val || val===0? Number(val): '';
    setDataFilter({ ...dataFilter, [key]: val });
  };

  const [paginate, setPaginate] = useState(new PaginateModel({}));
  const onChangePage = (page) => {
    setPaginate(new PaginateModel({ ...paginate, page: page }));
    onLoadData(null, { ...paginate, page: page });
    scrollToRef(tableRef);
  };
  const onChangePerPage = (pp) => {
    setPaginate(new PaginateModel({ ...paginate, pp: pp, page: 1 }));
    onLoadData(null, { ...paginate, pp: pp, page: 1 });
    scrollToRef(tableRef);
  };
  
  const [loading, setLoading] = useState(true);
  const onLoadData = async (e=null, listPaginate=null) => {
    if(e) e.preventDefault();
    setLoading(true);
    props.processClear('map-layers');
    let res = await props.processList('map-layers', {
      paginate: listPaginate? listPaginate: paginate,
      dataFilter: dataFilter
    }, true);
    setPaginate(res.paginate);
    setLoading(false);
  };

  
  const [selectedData, setSelectedData] = useState(null);
  const onModalToggle = (e=null, d=null) => {
    if(e) e.preventDefault();
    setSelectedData(d);
  };

  const onSubmitDelete = async (e) => {
    e.preventDefault();
    if(selectedData && selectedData.isDeletable){
      let res = await props.processDelete('map-layer', { _id: selectedData._id }, true);
      if(res) onLoadData();
    }
    onModalToggle();
  };


  /* eslint-disable */
	useEffect(() => { onMounted(); props.setSidenavActiveIndex(21); }, []);
	useEffect(() => { onLoadData(null, paginate); }, []);
  /* eslint-enable */

  return (
    <>
      <div className="app-container">
        <Breadcrumb 
          title="Map Layer Management" 
          structure={[
            { title: 'Admin', to: '/admin' },
            { title: 'Map Layers', to: '/admin/map-layers' }
          ]}
        />

        <div className="app-card pt-0 mt-4">
          <form onSubmit={onLoadData}>
            <div className="grids">
              <div className="grid sm-50 md-25 lg-25">
                <div className="form-control">
                  <div className="input-icon">
                    <input
                      type="text" placeholder="Search..." 
                      value={dataFilter.keywords? dataFilter.keywords: ''} 
                      onChange={e => onChangeDataFilter('keywords', e.target.value)} 
                    />
                    <button type="submit" className="icon-wrapper">
                      <em className="fa-solid fa-magnifying-glass"></em>
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid sm-50 md-25 lg-25">
                <div className="form-group">
                  <select 
                    value={dataFilter.status || dataFilter.status===0? dataFilter.status: ''} 
                    onChange={e => onChangeDataFilter('status', e.target.value, true)} 
                  >
                    <option value="">All statuses</option>
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="grid sm-50 md-20 lg-25 xs-text-center">
                <button type="submit" className="btn btn-action btn-s">
                  Search
                </button>
              </div>
              <div className="grid sm-50 md-30 lg-25 text-right xs-text-center">
                <Link to="/admin/map-layer/create" className="btn btn-action btn-s">
                  <em className="fa-solid fa-plus mr-2"></em>
                  Create Map Layer
                </Link>
              </div>
            </div>
          </form>
          <div className="table-wrapper pt-4">
            <table className="table" ref={tableRef}>
              <thead>
                <tr>
                  <th style={{ minWidth: 120, maxWidth: 120 }} className="text-center">Image</th>
                  <th style={{ minWidth: 100, maxWidth: 100 }} className="text-center">Icon</th>
                  <th style={{ minWidth: 180, width: '100%' }}>Layer name</th>
                  <th style={{ minWidth: 110 }} className="text-center">Status</th>
                  <th style={{ minWidth: 110 }} className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading? (
                  <tr><td colSpan={5} className="text-center">Loading data...</td></tr>
                ): (
                  props.list && props.list.length? (
                    props.list.map((d, i) => (
                      <tr key={i}>
                        <td>
                          <div className="table-img">
                            <img 
                              src={d.image.path? d.image.path: '/assets/img/default/img.jpg'} 
                              alt="Category" 
                            />
                          </div>
                        </td>
                        <td>
                          <div className="table-img sm">
                            <img 
                              src={d.icon.path? d.icon.path: '/assets/img/default/img.jpg'} 
                              alt="Icon" className="bradius-0" 
                            />
                          </div>
                        </td>
                        <td className="ws-nowrap">
                          <Link to={`/admin/map-layer/view/${d._id}`} className="h-color-p">
                            {d.name}
                          </Link>
                        </td>
                        <td className="text-center">{d.displayStatus()}</td>
                        <td className="text-center">
                          <Link to={`/admin/map-layer/view/${d._id}`} className="table-option color-info">
                            <em className="fa-regular fa-eye"></em>
                          </Link>
                          <Link to={`/admin/map-layer/update/${d._id}`} className="table-option color-success">
                            <em className="fa-regular fa-pen-to-square"></em>
                          </Link>
                          {d.isDeletable? (
                            <span onClick={e => onModalToggle(e, d)} className="table-option color-danger">
                              <em className="fa-regular fa-trash-can"></em>
                            </span>
                          ): (<></>)}
                        </td>
                      </tr>
                    ))
                  ): (
                    <tr><td colSpan={5} className="text-center">No data found.</td></tr>
                  )
                )}
              </tbody>
            </table>
          </div>
          <Pagination 
            paginate={paginate} 
            onChangePage={onChangePage} 
            onChangePerPage={onChangePerPage} 
          />
        </div>

        <Footer />
      </div>

      <div className={`popup-container ${selectedData? 'active': ''}`}>
        <div className="wrapper">
          <div className="popup-box">
            <div className="popup-header">
              <h6 className="fw-600 lh-xs">Confirm to delete</h6>
              <div className="btn-close" onClick={onModalToggle}>
                <div className="hamburger active">
                  <div></div><div></div><div></div>
                </div>
              </div>
            </div>
            <form onSubmit={onSubmitDelete}>
              <div className="popup-body">
                <p className="fw-500">
                  Please confirm to delete data.
                  The data cannot be retrieved after this confirmation.
                </p>
              </div>
              <div className="popup-footer">
                <div className="btns mt-0">
                  <button type="submit" className="btn btn-action btn-danger">
                    Delete
                  </button>
                  <button type="button" className="btn btn-action btn-default" onClick={onModalToggle}>
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

MapLayersPage.defaultProps = {
	
};
MapLayersPage.propTypes = {
	setSidenavActiveIndex: PropTypes.func.isRequired,
  processClear: PropTypes.func.isRequired,
  processList: PropTypes.func.isRequired,
  processDelete: PropTypes.func.isRequired
};

const mapStateToProps = (state) => ({
  list: state.app.mapLayers
});

export default connect(mapStateToProps, {
  setSidenavActiveIndex: setSidenavActiveIndex,
  processClear: processClear,
  processList: processList,
  processDelete: processDelete
})(MapLayersPage);