const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql'
  }
);

module.exports = sequelize;



sequelize.authenticate()
  .then(() => console.log('Conexão com MySQL bem-sucedida!'))
  .catch(err => console.error('Erro ao conectar no MySQL:', err));