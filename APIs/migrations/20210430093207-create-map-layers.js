'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('map_layers', {
      _id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
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
      
      color: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      opacity: {
        type: Sequelize.INTEGER,
        defaultValue: 25
      },
      
      type: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      attributes: {
        type: Sequelize.TEXT,
        defaultValue: '[]'
      },

      order: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      status: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      
      isDeletable: {
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
    await queryInterface.dropTable('map_layers');
  }
};