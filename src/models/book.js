module.exports = (sequelize, DataTypes) => {
    const Book = sequelize.define('Book', {
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      author: {
        type: DataTypes.STRING,
        allowNull: false
      },
      available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      pdfUrl: {
         type: DataTypes.STRING,
         allowNull: true
        }
    }, {
      timestamps: true
    });
  
    return Book;
  };