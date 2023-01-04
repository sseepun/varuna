'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_temps', {
      _id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'users', key: '_id' },
        onUpdate: 'NO ACTION',
        onDelete: 'CASCADE'
      },
      action: {
        allowNull: false,
        type: Sequelize.ENUM('Reset Password', 'Confirm Email', 'Activate Account')
      },
      token: {
        allowNull: false,
        type: Sequelize.STRING
      },
      isUsed: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },

      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        // defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_temps');
  }
};