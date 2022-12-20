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
  const onSubmitDataFilter = (e=null) => {
    if(e) e.preventDefault();
    setPaginate(new PaginateModel({ ...paginate, page: 1 }));
    onLoadData(null, { ...paginate, page: 1 });
    scrollToRef(tableRef);
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
          title="การจัดการเลเยอร์แผนที่" 
          structure={[
            { title: 'การจัดการข้อมูลแผนที่', to: '/admin' },
            { title: 'เลเยอร์แผนที่', to: '/admin/map-layers' }
          ]}
        />

        <div className="app-card pt-0 mt-4">
          <form onSubmit={onSubmitDataFilter}>
            <div className="grids">
              <div className="grid sm-50 md-25 lg-25">
                <div className="form-control">
                  <div className="input-icon">
                    <input
                      type="text" placeholder="ค้นหา..." 
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
                    <option value="">ทุกสถานะ</option>
                    <option value="1">เปิดใช้งาน</option>
                    <option value="0">ปิดใช้งาน</option>
                  </select>
                </div>
              </div>
              <div className="grid sm-50 md-20 lg-25 xs-text-center">
                <button type="submit" className="btn btn-action btn-p">
                  ค้นหา
                </button>
              </div>
              <div className="grid sm-50 md-30 lg-25 text-right xs-text-center">
                <Link to="/admin/map-layer/create" className="btn btn-action btn-p">
                  <em className="fa-solid fa-plus mr-2"></em>
                  สร้างเลเยอร์
                </Link>
              </div>
            </div>
          </form>
          <div className="table-wrapper pt-4">
            <table className="table" ref={tableRef}>
              <thead>
                <tr>
                  <th style={{ minWidth: 120, maxWidth: 120 }} className="text-center">รูปภาพ</th>
                  <th style={{ minWidth: 100, maxWidth: 100 }} className="text-center">ไอคอน</th>
                  <th style={{ minWidth: 180, width: '100%' }}>ชื่อเลเยอร์</th>
                  <th style={{ minWidth: 140 }} className="text-center">การแสดงผล</th>
                  <th style={{ minWidth: 110 }} className="text-center">สถานะ</th>
                  <th style={{ minWidth: 110 }} className="text-center">การกระทำ</th>
                </tr>
              </thead>
              <tbody>
                {loading? (
                  <tr><td colSpan={6} className="text-center">กำลังโหลดข้อมูล...</td></tr>
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
                        <td className="ws-nowrap text-center">{d.displayType()}</td>
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
                    <tr><td colSpan={6} className="text-center">ไม่พบข้อมูลในระบบ</td></tr>
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
              <h6 className="fw-600 lh-xs">ยืนยันการลบข้อมูล</h6>
              <div className="btn-close" onClick={onModalToggle}>
                <div className="hamburger active">
                  <div></div><div></div><div></div>
                </div>
              </div>
            </div>
            <form onSubmit={onSubmitDelete}>
              <div className="popup-body">
                <p className="fw-500">
                  กรุณายืนยันการลบข้อมูล ข้อมูลไม่สามารถนำกลับมาได้หลังจากถูกลบไปแล้ว
                </p>
              </div>
              <div className="popup-footer">
                <div className="btns mt-0">
                  <button type="submit" className="btn btn-action btn-p">
                    ยืนยันการลบ
                  </button>
                  <button type="button" className="btn btn-action btn-default" onClick={onModalToggle}>
                    ปิด
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