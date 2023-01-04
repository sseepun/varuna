'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MapPermission extends Model {
    
  };
  MapPermission.init({
    _id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    mapProjectId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },

    create: { type: DataTypes.INTEGER },
    read: { type: DataTypes.INTEGER },
    update: { type: DataTypes.INTEGER },
    delete: { type: DataTypes.INTEGER },
  }, {
    sequelize,
    modelName: 'map_permissions',
    underscored: false,
  });
  return MapPermission;
};