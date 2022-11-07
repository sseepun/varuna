'use strict';

/*
  logs : Array
    log : Object
      value : String / Number
      createdAt : DateTime
*/

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('robot_feature_logs', {
      _id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      robotId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'robots', key: '_id' },
        onUpdate: 'NO ACTION',
        onDelete: 'CASCADE'
      },
      robotFeatureId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'robot_features', key: '_id' },
        onUpdate: 'NO ACTION',
        onDelete: 'CASCADE'
      },
      
      logs: {
        allowNull: true,
        type: Sequelize.TEXT,
        defaultValue: '[]'
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
    await queryInterface.dropTable('robot_feature_logs');
  }
};