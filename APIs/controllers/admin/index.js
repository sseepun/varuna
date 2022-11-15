
const appProcess = require('./app.process');
const mapProcess = require('./map.process');

module.exports = {
  ...appProcess,
  ...mapProcess,
};