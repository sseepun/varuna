'use strict';

/*
  status : Number
    0 = Inactive
    1 = Active
*/

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('map_layer_mappings', {
      _id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      mapLayerId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'map_layers', key: '_id' },
        onUpdate: 'NO ACTION',
        onDelete: 'CASCADE'
      },
      mapDataId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'map_datas', key: '_id' },
        onUpdate: 'NO ACTION',
        onDelete: 'CASCADE'
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
    await queryInterface.dropTable('map_layer_mappings');
  }
};