
const userProcess = require('./user.process');
const mapProcess = require('./map.process');

module.exports = {
  ...userProcess,
  ...mapProcess,
};