'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {

    // User Roles & Users
    let salt = await bcrypt.genSalt(10);
    let bcryptPassword = await bcrypt.hash('aaaa1!', salt);
    await queryInterface
      .bulkInsert('user_roles', [{ name: 'User', level: 1 }], { returning: ['_id'] })
      .then((roleId) => {
        queryInterface.bulkInsert('users', [{
          userRoleId: roleId,
          email: 'user@gmail.com',
          password: bcryptPassword,
          firstname: 'General',
          lastname: 'User',
          status: 1
        }]);
      });
    await queryInterface
      .bulkInsert('user_roles', [{ name: 'Admin', level: 98 }], { returning: ['_id'] })
      .then((roleId) => {
        queryInterface.bulkInsert('users', [{
          userRoleId: roleId,
          email: 'admin@gmail.com',
          password: bcryptPassword,
          firstname: 'General',
          lastname: 'Admin',
          status: 1
        }]);
      });
    await queryInterface
      .bulkInsert('user_roles', [{ name: 'SuperAdmin', level: 99 }], { returning: ['_id'] })
      .then((roleId) => {
        queryInterface.bulkInsert('users', [{
          userRoleId: roleId,
          email: 'sadmin@gmail.com',
          password: bcryptPassword,
          firstname: 'Super',
          lastname: 'Admin',
          status: 1
        }]);
        queryInterface.bulkInsert('users', [{
          userRoleId: roleId,
          email: 'sseepun@gmail.com',
          password: bcryptPassword,
          firstname: 'Sarun',
          lastname: 'Seepun',
          status: 1
        }]);
        queryInterface.bulkInsert('users', [{
          userRoleId: roleId,
          email: 'ball@gmail.com',
          password: bcryptPassword,
          firstname: 'Ball',
          lastname: 'Tawat',
          status: 1
        }]);
      });

    // Robot Room Type

    // Robot Feature
    await queryInterface.bulkInsert('robot_features', [{
      code: '1',
      name: 'Temperature',
    }], { returning: ['_id'] });
    await queryInterface.bulkInsert('robot_features', [{
      code: '2',
      name: 'Moisture',
    }], { returning: ['_id'] });
    await queryInterface.bulkInsert('robot_features', [{
      code: '3',
      name: 'Light Intensity',
    }], { returning: ['_id'] });

  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('user_roles', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
