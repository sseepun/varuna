'use strict';

/*
  status : Number
    -1 = Request to delete
    0  = Inactive
    1  = Active
*/

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      _id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      refId: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: ''
      },
      userRoleId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: { model: 'user_roles', key: '_id' },
        onUpdate: 'NO ACTION',
        onDelete: 'SET NULL'
      },

      email: {
        type: Sequelize.STRING(127),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: { msg: 'Email is required.' },
          unique: { msg: 'Email must be unique.' }
        }
      },
      password: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Password is required.' }
        }
      },

      telephone: {
        allowNull: true,
        type: Sequelize.STRING(63),
        defaultValue: ''
      },
      username: {
        allowNull: true,
        type: Sequelize.STRING(127),
        defaultValue: ''
      },
      avatar: {
        allowNull: true,
        type: Sequelize.TEXT,
      },

      firstname: {
        allowNull: true,
        type: Sequelize.STRING(63),
        defaultValue: ''
      },
      lastname: {
        allowNull: true,
        type: Sequelize.STRING(63),
        defaultValue: ''
      },

      fcmToken: {
        allowNull: true,
        type: Sequelize.TEXT,
        defaultValue: ''
      },
      refreshToken: {
        allowNull: true,
        type: Sequelize.TEXT,
        defaultValue: ''
      },
      
      status: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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
    await queryInterface.dropTable('users');
  }
};