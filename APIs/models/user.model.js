'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {

  };
  User.init({
    _id: { type: DataTypes.INTEGER, primaryKey: true },
    
    refId: { type: DataTypes.STRING },
    userRoleId: { type: DataTypes.INTEGER },

    email: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.INTEGER, allowNull: false },
    
    telephone: { type: DataTypes.STRING },
    username: { type: DataTypes.STRING },
    avatar: { type: DataTypes.STRING },
    
    firstname: { type: DataTypes.STRING },
    lastname: { type: DataTypes.STRING },
    
    fcmToken: { type: DataTypes.STRING },
    refreshToken: { type: DataTypes.STRING },
    
    status: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    sequelize,
    modelName: 'users',
    underscored: false,
  });
  return User;
};