const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
	process.env.DB_NAME || 'poke_team',
	process.env.DB_USER || 'poke_user',
	process.env.DB_PASSWORD || 'poke_pass',
	{
		host: process.env.DB_HOST || '127.0.0.1',
		port: Number(process.env.DB_PORT || 3306),
		dialect: 'mysql',
		logging: false,
		pool: {
			max: Number(process.env.DB_POOL_LIMIT || 10),
			min: 0,
			idle: 10000,
			acquire: 30000,
		},
	}
);

module.exports = sequelize;
