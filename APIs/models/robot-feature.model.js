'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RobotFeature extends Model {
    
  };
  RobotFeature.init({
    _id: { type: DataTypes.INTEGER, primaryKey: true },

    code: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING },
    
    image: { type: DataTypes.STRING },
    icon: { type: DataTypes.STRING },
  }, {
    sequelize,
    modelName: 'robot_features',
    underscored: false,
  });
  return RobotFeature;
};