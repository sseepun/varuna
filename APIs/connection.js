const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USER,
    process.env.DB_PASS, {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: false
    }
);

const testConnectig = async () => {
    try {
        await sequelize.authenticate();
    } catch (error) {
        throw console.error('Unable to connect to the database:', error);
    }
}

const Database = async () => {
    try {
        await testConnectig()
        console.log('MySQL database connected...');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}


module.exports = {
    sequelize,
    Database
};
