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

      mapProjectId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: { model: 'map_projects', key: '_id' },
        onUpdate: 'NO ACTION',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      
      data: {
        allowNull: true,
        type: Sequelize.TEXT,
        defaultValue: ''
      },
      data2: {
        allowNull: true,
        type: Sequelize.TEXT,
        defaultValue: ''
      },
      data3: {
        allowNull: true,
        type: Sequelize.TEXT,
        defaultValue: ''
      },
      data4: {
        allowNull: true,
        type: Sequelize.TEXT,
        defaultValue: ''
      },
      data5: {
        allowNull: true,
        type: Sequelize.TEXT,
        defaultValue: ''
      },
      data6: {
        allowNull: true,
        type: Sequelize.TEXT,
        defaultValue: ''
      },
      data7: {
        allowNull: true,
        type: Sequelize.TEXT,
        defaultValue: ''
      },
      data8: {
        allowNull: true,
        type: Sequelize.TEXT,
        defaultValue: ''
      },
      data9: {
        allowNull: true,
        type: Sequelize.TEXT,
        defaultValue: ''
      },
      data10: {
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
        // defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('map_datas');
  }
};