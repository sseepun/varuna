'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserTemp extends Model {

  };
  UserTemp.init({
    _id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    
    userId: { type: DataTypes.INTEGER, allowNull: false },
    action: { type: DataTypes.STRING, allowNull: false },
    token: { type: DataTypes.STRING, allowNull: false },
    isUsed: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    sequelize,
    modelName: 'user_temps',
    underscored: false,
  });
  return UserTemp;
};