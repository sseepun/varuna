'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MapData extends Model {

  };
  MapData.init({
    _id: { type: DataTypes.INTEGER, primaryKey: true },

    mapProjectId: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },

    data: { type: DataTypes.STRING },

    startAt: { type: DataTypes.DATE },
    endAt: { type: DataTypes.DATE },
    
    status: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    sequelize,
    modelName: 'map_datas',
    underscored: false,
  });
  return MapData;
};