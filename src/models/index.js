const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const BookModel = require('./book');

const Book = BookModel(sequelize, DataTypes);

module.exports = {
  sequelize,
  Book,
};