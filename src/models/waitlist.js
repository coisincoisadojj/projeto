const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const User = require('./user');
const Book = require('./book');

const Waitlist = sequelize.define('Waitlist', {
  position: DataTypes.INTEGER
});

Waitlist.belongsTo(User);
Waitlist.belongsTo(Book);

module.exports = Waitlist;