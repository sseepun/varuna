'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {

  };
  User.init({
    _id: { type: DataTypes.INTEGER, primaryKey: true },
    
    userRoleId: { type: DataTypes.INTEGER },

    username: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.INTEGER, allowNull: false },
    
    firstname: { type: DataTypes.STRING },
    lastname: { type: DataTypes.STRING },
    telephone: { type: DataTypes.STRING },
    
    avatar: { type: DataTypes.STRING },
    
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