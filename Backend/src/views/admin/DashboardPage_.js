import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { onMounted, formatNumber } from '../../helpers/frontend';
import Breadcrumb from '../../components/Breadcrumb';
import Footer from '../../components/Footer';
import ReactECharts from 'echarts-for-react';

import { connect } from 'react-redux';
import { setSidenavActiveIndex } from '../../actions/app.actions';
import { processList } from '../../actions/admin.actions';


function DashboardPage(props) {
  const [report1, setReport1] = useState({ newToday: 0, newThisMonth: 0, newThisYear: 0, total: 0 });
  const [report2, setReport2] = useState({
    salesToday: { grandTotalNew: 0, grandTotalOld: 0, grandTotal: 0 },
    salesThisMonth: { grandTotalNew: 0, grandTotalOld: 0, grandTotal: 0 },
    salesThisYear: { grandTotalNew: 0, grandTotalOld: 0, grandTotal: 0 }
  });

  /* eslint-disable */
	useEffect(() => { onMounted(); props.setSidenavActiveIndex(1); }, []);
	useEffect(() => {
    let year = new Date().getFullYear();
    props.processList('report-customer-total', { dataFilter: { year: year } }, true).then(d => {
      if(d && d.result) setReport1(d.result);
    });
    props.processList('report-customer-order-total', { dataFilter: { year: year } }, true).then(d => {
      if(d && d.result) setReport2(d.result);
    });
  }, []);
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
        <div className="grid lg-25 md-50">
          <div className="app-card p-0 h-full">
            <Link className="ss-card-01 h-color-p" to="/admin/admins">
              <div className="ss-img horizontal">
                <div className="img-bg" style={{ backgroundImage: `url('/assets/img/bg/feature-01.jpg')` }}></div>
              </div>
              <div className="text-wrapper">
                <div className="h5 fw-800 lh-xs">Admin Management</div>
              </div>
            </Link>
          </div>
        </div>
        <div className="grid lg-25 md-50">
          <div className="app-card p-0 h-full">
            <Link className="ss-card-01 h-color-p" to="/admin/users">
              <div className="ss-img horizontal">
                <div className="img-bg" style={{ backgroundImage: `url('/assets/img/bg/feature-02.jpg')` }}></div>
              </div>
              <div className="text-wrapper">
                <div className="h5 fw-800 lh-xs">User Management</div>
              </div>
            </Link>
          </div>
        </div>
        <div className="grid lg-25 md-50">
          <div className="app-card p-0 h-full">
            <Link className="ss-card-01 h-color-p" to="/admin/map-layers">
              <div className="ss-img horizontal">
                <div className="img-bg" style={{ backgroundImage: `url('/assets/img/bg/feature-03.jpg')` }}></div>
              </div>
              <div className="text-wrapper">
                <div className="h5 fw-800 lh-xs">Layer Management</div>
              </div>
            </Link>
          </div>
        </div>
        <div className="grid lg-25 md-50">
          <div className="app-card p-0 h-full">
            <Link className="ss-card-01 h-color-p" to="/admin/map-datas">
              <div className="ss-img horizontal">
                <div className="img-bg" style={{ backgroundImage: `url('/assets/img/bg/feature-04.jpg')` }}></div>
              </div>
              <div className="text-wrapper">
                <div className="h5 fw-800 lh-xs">Map Data</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="grids">
        <div className="grid xl-25 md-50 sm-100">
          <div className="app-card text-center">
            <p className="lg fw-800">ผู้ใช้ใหม่วันนี้</p>
            <div className="ss-sep-01 mt-3"></div>
            <p className="mt-3">
              <span className="h3 fw-700 lh-xs color-info mr-2">
                {formatNumber(report1.newToday, 0)}
              </span>
              <span className="fw-700 op-50">คน</span>
            </p>
          </div>
        </div>
        <div className="grid xl-25 md-50 sm-100">
          <div className="app-card text-center">
            <p className="lg fw-800">ผู้ใช้ใหม่เดือนนี้</p>
            <div className="ss-sep-01 mt-3"></div>
            <p className="mt-3">
              <span className="h3 fw-700 lh-xs color-info mr-2">
                {formatNumber(report1.newThisMonth, 0)}
              </span>
              <span className="fw-700 op-50">คน</span>
            </p>
          </div>
        </div>
        <div className="grid xl-25 md-50 sm-100">
          <div className="app-card text-center">
            <p className="lg fw-800">ผู้ใช้ใหม่ปีนี้</p>
            <div className="ss-sep-01 mt-3"></div>
            <p className="mt-3">
              <span className="h3 fw-700 lh-xs color-info mr-2">
                {formatNumber(report1.newThisYear, 0)}
              </span>
              <span className="fw-700 op-50">คน</span>
            </p>
          </div>
        </div>
        <div className="grid xl-25 md-50 sm-100">
          <div className="app-card text-center">
            <p className="lg fw-800">ผู้ใช้รวมทั้งหมด</p>
            <div className="ss-sep-01 mt-3"></div>
            <p className="mt-3">
              <span className="h3 fw-700 lh-xs color-info mr-2">
                {formatNumber(report1.total, 0)}
              </span>
              <span className="fw-700 op-50">คน</span>
            </p>
          </div>
        </div>

        <div className="grid xl-1-3 md-50 sm-100">
          <div className="app-card text-center">
            <p className="lg fw-800">ยอดขายวันนี้</p>
            <div className="ss-sep-01 mt-3"></div>
            <p className="mt-3">
              <span className="h3 fw-700 lh-xs color-info mr-2">
                {formatNumber(report2.salesToday.grandTotal)}
              </span>
              <span className="fw-700 op-50">บาท</span>
            </p>
            <div className="w-full">
              <ReactECharts 
                option={{
                  title: { text: '', subtext: '', x: 'center' },
                  tooltip: {
                    trigger: 'item',
                    formatter: (param => {
                      return `${param.data.name} = ${formatNumber(param.percent)}%<br />
                        ${formatNumber(param.data.value)} บาท`;
                    })
                  },
                  legend: {
                    x: 'center', y: 'bottom',
                    data: ['จากผู้ใช้ใหม่', 'จากผู้ใช้เก่า'],
                    textStyle: { color: '#555555' }
                  },
                  series: [{
                    name: '', type: 'pie',
                    radius: [0, 110], center: ['50%', '46%'],
                    label: { show: false }, lableLine: { show: false },
                    emphasis: {
                      label: { show: false },
                      lableLine: { show: false }
                    },
                    data: [
                      { value: report2.salesToday.grandTotalNew, name: 'จากผู้ใช้ใหม่' }, 
                      { value: report2.salesToday.grandTotalOld, name: 'จากผู้ใช้เก่า' }, 
                    ]
                  }],
                  color: ['#5a8dee', '#ffcc26']
                }}
              />
            </div>
          </div>
        </div>
        <div className="grid xl-1-3 md-50 sm-100">
          <div className="app-card text-center">
            <p className="lg fw-800">ยอดขายเดือนนี้</p>
            <div className="ss-sep-01 mt-3"></div>
            <p className="mt-3">
              <span className="h3 fw-700 lh-xs color-info mr-2">
                {formatNumber(report2.salesThisMonth.grandTotal)}
              </span>
              <span className="fw-700 op-50">บาท</span>
            </p>
            <div className="w-full">
              <ReactECharts 
                option={{
                  title: { text: '', subtext: '', x: 'center' },
                  tooltip: {
                    trigger: 'item',
                    formatter: (param => {
                      return `${param.data.name} = ${formatNumber(param.percent)}%<br />
                        ${formatNumber(param.data.value)} บาท`;
                    })
                  },
                  legend: {
                    x: 'center', y: 'bottom',
                    data: ['จากผู้ใช้ใหม่', 'จากผู้ใช้เก่า'],
                    textStyle: { color: '#555555' }
                  },
                  series: [{
                    name: '', type: 'pie',
                    radius: [0, 110], center: ['50%', '46%'],
                    label: { show: false }, lableLine: { show: false },
                    emphasis: {
                      label: { show: false },
                      lableLine: { show: false }
                    },
                    data: [
                      { value: report2.salesThisMonth.grandTotalNew, name: 'จากผู้ใช้ใหม่' }, 
                      { value: report2.salesThisMonth.grandTotalOld, name: 'จากผู้ใช้เก่า' }, 
                    ]
                  }],
                  color: ['#5a8dee', '#ffcc26']
                }}
              />
            </div>
          </div>
        </div>
        <div className="grid xl-1-3 md-100 sm-100">
          <div className="app-card text-center">
            <p className="lg fw-800">ยอดขายปีนี้</p>
            <div className="ss-sep-01 mt-3"></div>
            <p className="mt-3">
              <span className="h3 fw-700 lh-xs color-info mr-2">
                {formatNumber(report2.salesThisYear.grandTotal)}
              </span>
              <span className="fw-700 op-50">บาท</span>
            </p>
            <div className="w-full">
              <ReactECharts 
                option={{
                  title: { text: '', subtext: '', x: 'center' },
                  tooltip: {
                    trigger: 'item',
                    formatter: (param => {
                      return `${param.data.name} = ${formatNumber(param.percent)}%<br />
                        ${formatNumber(param.data.value)} บาท`;
                    })
                  },
                  legend: {
                    x: 'center', y: 'bottom',
                    data: ['จากผู้ใช้ใหม่', 'จากผู้ใช้เก่า'],
                    textStyle: { color: '#555555' }
                  },
                  series: [{
                    name: '', type: 'pie',
                    radius: [0, 110], center: ['50%', '46%'],
                    label: { show: false }, lableLine: { show: false },
                    emphasis: {
                      label: { show: false },
                      lableLine: { show: false }
                    },
                    data: [
                      { value: report2.salesThisYear.grandTotalNew, name: 'จากผู้ใช้ใหม่' }, 
                      { value: report2.salesThisYear.grandTotalOld, name: 'จากผู้ใช้เก่า' }, 
                    ]
                  }],
                  color: ['#5a8dee', '#ffcc26']
                }}
              />
            </div>
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