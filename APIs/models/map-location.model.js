'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MapLocation extends Model {
    
  };
  MapLocation.init({
    _id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    address: { type: DataTypes.STRING },
    subdistrict: { type: DataTypes.STRING },
    district: { type: DataTypes.STRING },
    province: { type: DataTypes.STRING },
    zipcode: { type: DataTypes.STRING },
    country: { type: DataTypes.STRING },
  }, {
    sequelize,
    modelName: 'map_locations',
    underscored: false,
  });
  return MapLocation;
};