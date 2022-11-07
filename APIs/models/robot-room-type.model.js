'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RobotRoomType extends Model {
    
  };
  RobotRoomType.init({
    _id: { type: DataTypes.INTEGER, primaryKey: true },

    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING },
    
    image: { type: DataTypes.STRING },
    icon: { type: DataTypes.STRING },
  }, {
    sequelize,
    modelName: 'robot_room_types',
    underscored: false,
  });
  return RobotRoomType;
};