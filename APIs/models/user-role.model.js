'use strict';
const { Model } = require('sequelize');

/*
  level : Number
    1  = User
    98 = Admin
    99 = Super Admin
*/

module.exports = (sequelize, DataTypes) => {
  class UserRole extends Model {
    
  };
  UserRole.init({
    _id: { type: DataTypes.INTEGER, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    level: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    sequelize,
    modelName: 'user_roles',
    underscored: false,
  });
  return UserRole;
};