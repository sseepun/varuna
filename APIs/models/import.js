const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');


// Models
const UserRole = require('./user-role.model')(sequelize, DataTypes);
const User = require('./user.model')(sequelize, DataTypes);
const UserTemp = require('./user-temp.model')(sequelize, DataTypes);

const MapLocation = require('./map-location.model')(sequelize, DataTypes);
const MapData = require('./map-data.model')(sequelize, DataTypes);
const MapPermission = require('./map-permission.model')(sequelize, DataTypes);

const MapLayer = require('./map-layer.model')(sequelize, DataTypes);
const MapLayerMapping = require('./map-layer-mapping.model')(sequelize, DataTypes);


// Associations
User.belongsTo(UserRole);
UserTemp.belongsTo(User);

MapData.hasOne(MapLocation);
MapPermission.belongsTo(MapData);
MapPermission.belongsTo(User);

MapLayerMapping.belongsTo(MapLayer);
MapLayerMapping.belongsTo(MapData);


module.exports = {
  UserRole: UserRole,
  User: User,
  UserTemp: UserTemp,
  MapLocation: MapLocation,
  MapData: MapData,
  MapPermission: MapPermission,
  MapLayer: MapLayer,
  MapLayerMapping: MapLayerMapping,
};