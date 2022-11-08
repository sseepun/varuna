'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MapPermission extends Model {
    
  };
  MapPermission.init({
    _id: { type: DataTypes.INTEGER, primaryKey: true },

    mapLayerId: { type: DataTypes.INTEGER, allowNull: false },
    mapDataId: { type: DataTypes.INTEGER, allowNull: false },

    data: { type: DataTypes.STRING },
    
    status: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    sequelize,
    modelName: 'map_layer_mappings',
    underscored: false,
  });
  return MapPermission;
};