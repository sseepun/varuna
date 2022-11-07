'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Robot extends Model {

  };
  Robot.init({
    _id: { type: DataTypes.INTEGER, primaryKey: true },
    
    refId: { type: DataTypes.STRING },
    model: { type: DataTypes.STRING },
    secretId: { type: DataTypes.STRING },
    serialNumber: { type: DataTypes.STRING },

    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING },
  }, {
    sequelize,
    modelName: 'users',
    underscored: false,
  });
  return Robot;
};