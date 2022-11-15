'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MapLayer extends Model {

  };
  MapLayer.init({
    _id: { type: DataTypes.INTEGER, primaryKey: true },

    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING },
    
    image: { type: DataTypes.STRING },
    icon: { type: DataTypes.STRING },
    
    isDeletable: { type: DataTypes.INTEGER, allowNull: false },
    
    status: { type: DataTypes.INTEGER },
  }, {
    sequelize,
    modelName: 'map_layers',
    underscored: false,
  });
  return MapLayer;
};