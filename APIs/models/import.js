const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');


// Models
const UserRole = require('./user-role.model')(sequelize, DataTypes);
const User = require('./user.model')(sequelize, DataTypes);
const UserTemp = require('./user-temp.model')(sequelize, DataTypes);

const RobotRoomType = require('./robot-room-type.model')(sequelize, DataTypes);
const RobotFeature = require('./robot-feature.model')(sequelize, DataTypes);
const Robot = require('./robot.model')(sequelize, DataTypes);


// Associations
User.belongsTo(UserRole);

Robot.belongsTo(User);
Robot.belongsTo(RobotRoomType);


module.exports = {
  UserRole: UserRole,
  User: User,
  UserTemp: UserTemp,
  RobotRoomType: RobotRoomType,
  RobotFeature: RobotFeature,
  Robot: Robot,
};