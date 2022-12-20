'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MapLayerMapping extends Model {
    
  };
  MapLayerMapping.init({
    _id: { type: DataTypes.INTEGER, primaryKey: true },

    mapLayerId: { type: DataTypes.INTEGER, allowNull: false },
    mapDataId: { type: DataTypes.INTEGER, allowNull: false },

    data: { type: DataTypes.STRING },
    
    startAt: { type: DataTypes.DATE },
    endAt: { type: DataTypes.DATE },
    
    status: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    sequelize,
    modelName: 'map_layer_mappings',
    underscored: false,
  });
  return MapLayerMapping;
};