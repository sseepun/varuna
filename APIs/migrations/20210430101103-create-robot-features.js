'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('robot_features', {
      _id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      
      code: {
        type: Sequelize.STRING(127),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: { msg: 'Code is required.' },
          unique: { msg: 'Code must be unique.' }
        }
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
      description: {
        allowNull: true,
        type: Sequelize.TEXT,
        defaultValue: ''
      },
      
      image: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      icon: {
        allowNull: true,
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('robot_features');
  }
};