
const appProcess = require('./app.process');
const partnerProcess = require('./partner.process');
const reportProcess = require('./report.process');
const cmsProcess = require('./cms.process');

module.exports = {
  ...appProcess,
  ...partnerProcess,
  ...reportProcess,
  ...cmsProcess,
};