'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('map_datas', {
      _id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      mapLocationId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: { model: 'map_locations', key: '_id' },
        onUpdate: 'NO ACTION',
        onDelete: 'NO ACTION'
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
      
      data: {
        allowNull: true,
        type: Sequelize.TEXT,
        defaultValue: ''
      },
      
      startAt: {
        type: Sequelize.DATE,
        defaultValue: null,
      },
      endAt: {
        type: Sequelize.DATE,
        defaultValue: null,
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
    await queryInterface.dropTable('map_datas');
  }
};