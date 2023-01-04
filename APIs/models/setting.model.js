'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Setting extends Model {

  };
  Setting.init({
    _id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    
    name: { type: DataTypes.STRING, allowNull: false },
    value: { type: DataTypes.STRING },
  }, {
    sequelize,
    modelName: 'settings',
    underscored: false,
  });
  return Setting;
};