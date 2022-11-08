'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {

    // User Roles & Users
    let salt = await bcrypt.genSalt(10);
    let bcryptPassword = await bcrypt.hash('aaaa1!', salt);
    await queryInterface
      .bulkInsert('user_roles', [{ name: 'User', level: 1, isDefault: 1 }], { returning: ['_id'] })
      .then((roleId) => {
        queryInterface.bulkInsert('users', [{
          userRoleId: roleId,
          username: 'User',
          email: 'user@gmail.com',
          password: bcryptPassword,
          firstname: 'General',
          lastname: 'User',
          status: 1
        }]);
      });
    await queryInterface
      .bulkInsert('user_roles', [{ name: 'Admin', level: 98, isDefault: 0 }], { returning: ['_id'] })
      .then((roleId) => {
        queryInterface.bulkInsert('users', [{
          userRoleId: roleId,
          username: 'Admin',
          email: 'admin@gmail.com',
          password: bcryptPassword,
          firstname: 'General',
          lastname: 'Admin',
          status: 1
        }]);
      });
    await queryInterface
      .bulkInsert('user_roles', [{ name: 'SuperAdmin', level: 99, isDefault: 0 }], { returning: ['_id'] })
      .then((roleId) => {
        queryInterface.bulkInsert('users', [{
          userRoleId: roleId,
          username: 'SuperAdmin',
          email: 'sadmin@gmail.com',
          password: bcryptPassword,
          firstname: 'Super',
          lastname: 'Admin',
          status: 1
        }]);
        queryInterface.bulkInsert('users', [{
          userRoleId: roleId,
          username: 'sseepun',
          email: 'sseepun@gmail.com',
          password: bcryptPassword,
          firstname: 'Sarun',
          lastname: 'Seepun',
          status: 1
        }]);
      });

  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('user_roles', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
