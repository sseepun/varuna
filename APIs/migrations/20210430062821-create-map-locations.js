'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('map_locations', {
      _id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      
      address: {
        allowNull: true,
        type: Sequelize.TEXT,
        defaultValue: ''
      },
      subdistrict: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: ''
      },
      district: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: ''
      },
      zipcode: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: ''
      },
      country: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: ''
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
    await queryInterface.dropTable('map_locations');
  }
};