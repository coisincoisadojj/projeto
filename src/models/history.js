const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const User = require('./user');
const Book = require('./book');

const History = sequelize.define('History', {
  readAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

History.belongsTo(User);
History.belongsTo(Book);

module.exports = History;