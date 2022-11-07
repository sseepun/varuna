'use strict';

/*
  status : Number
    0 = Inactive
    1 = Active
*/

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('robot_feature_mappings', {
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
    await queryInterface.dropTable('robot_feature_mappings');
  }
};