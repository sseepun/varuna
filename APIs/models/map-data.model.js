'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MapData extends Model {

  };
  MapData.init({
    _id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    mapProjectId: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },

    data: { type: DataTypes.STRING },
    data2: { type: DataTypes.STRING, allowNull: true },
    data3: { type: DataTypes.STRING, allowNull: true },
    data4: { type: DataTypes.STRING, allowNull: true },
    data5: { type: DataTypes.STRING, allowNull: true },
    data6: { type: DataTypes.STRING, allowNull: true },
    data7: { type: DataTypes.STRING, allowNull: true },
    data8: { type: DataTypes.STRING, allowNull: true },
    data9: { type: DataTypes.STRING, allowNull: true },
    data10: { type: DataTypes.STRING, allowNull: true },

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