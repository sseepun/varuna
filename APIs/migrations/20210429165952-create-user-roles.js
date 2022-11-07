'use strict';

/*
  level : Number
    1  = User
    98 = Admin
    99 = Super Admin
*/

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_roles', {
      _id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      
      name: {
        type: Sequelize.STRING(127),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: { msg: 'Name is required.' },
          unique: { msg: 'Name must be unique.' }
        }
      },
      level: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },

      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_roles');
  }
};