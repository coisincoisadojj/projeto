require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.get('/teste', (req, res) => {
  res.json({ message: 'Servidor funcionando e rota teste ok!' });
});

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/books', bookRoutes);


app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 3000;

const sequelize = require('./config/db');
const Book = require('./models/book');

sequelize.authenticate()
  .then(() => {
    console.log('Conexão com MySQL bem-sucedida!');
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log(' Banco de dados sincronizado');
    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Erro ao conectar ou sincronizar com o banco:', error);
  });

module.exports = app;