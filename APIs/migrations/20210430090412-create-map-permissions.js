'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('map_permissions', {
      _id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      mapProjectId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'map_projects', key: '_id' },
        onUpdate: 'NO ACTION',
        onDelete: 'CASCADE'
      },
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'users', key: '_id' },
        onUpdate: 'NO ACTION',
        onDelete: 'CASCADE'
      },
      
      create: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      read: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      update: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      delete: {
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
    await queryInterface.dropTable('map_permissions');
  }
};