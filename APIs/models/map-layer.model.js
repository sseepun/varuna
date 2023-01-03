'use strict';
const { Model } = require('sequelize');

/*
  type : Integer
    1 = Table
    2 = Vertical Bar Chart
    3 = Horizontal Bar Chart
    4 = Pie Chart
    5 = Donut Chart

  attributes : Array
    attribute : Object
      name : String
      unit : String
      key : String
*/

module.exports = (sequelize, DataTypes) => {
  class MapLayer extends Model {

  };
  MapLayer.init({
    _id: { type: DataTypes.INTEGER, primaryKey: true },

    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING },
    
    image: { type: DataTypes.STRING },
    icon: { type: DataTypes.STRING },

    color: { type: DataTypes.STRING, defaultValue: '' },
    opacity: { type: DataTypes.INTEGER, defaultValue: 0 },
    
    type: { type: DataTypes.INTEGER, defaultValue: 1 },
    attributes: { type: DataTypes.STRING, defaultValue: '[]' },

    order: { type: DataTypes.INTEGER, defaultValue: 1 },
    status: { type: DataTypes.INTEGER },

    isDeletable: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    sequelize,
    modelName: 'map_layers',
    underscored: false,
  });
  return MapLayer;
};