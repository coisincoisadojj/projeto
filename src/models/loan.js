const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const User = require('./user');
const Book = require('./book');

const Loan = sequelize.define('Loan', {
  dueDate: DataTypes.DATE,
  returned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

Loan.belongsTo(User);
Loan.belongsTo(Book);

module.exports = Loan;