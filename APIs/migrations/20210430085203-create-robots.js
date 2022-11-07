'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('robots', {
      _id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      
      refId: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: ''
      },
      model: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: ''
      },
      secretId: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: ''
      },
      serialNumber: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: ''
      },

      robotRoomTypeId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: { model: 'robot_room_types', key: '_id' },
        onUpdate: 'NO ACTION',
        onDelete: 'SET NULL'
      },
      ownerId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: { model: 'users', key: '_id' },
        onUpdate: 'NO ACTION',
        onDelete: 'SET NULL'
      },
      
      name: {
        type: Sequelize.STRING(127),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Name is required.' },
        }
      },
      description: {
        allowNull: true,
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable('robots');
  }
};