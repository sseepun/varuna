'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MapProject extends Model {

  };
  MapProject.init({
    _id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    mapLocationId: { type: DataTypes.INTEGER, allowNull: false },

    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING },
    
    image: { type: DataTypes.STRING },
    gallery: { type: DataTypes.STRING },
    
    status: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    sequelize,
    modelName: 'map_projects',
    underscored: false,
  });
  return MapProject;
};