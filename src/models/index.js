const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('biblioteca', 'root', 'sua_senha', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});

sequelize.authenticate()
  .then(() => console.log('Conectado ao MySQL com sucesso!'))
  .catch((err) => console.error('Erro ao conectar:', err));

module.exports = sequelize;