require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db'); // <-- ADICIONADO AQUI

const app = express(); 

app.get('/teste', (req, res) => {
  res.json({ message: 'Servidor funcionando e rota teste ok!' });
});

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const loanRoutes = require('./routes/loanRoutes');

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/books', bookRoutes);
app.use('/loans', loanRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});


sequelize.authenticate()
  .then(() => {
    console.log('Conexão com MySQL bem-sucedida!');
    return sequelize.sync(); 
  })
  .then(() => {
    console.log('Tabelas sincronizadas com sucesso!');
  })
  .catch(err => {
    console.error('Erro ao conectar ou sincronizar com o MySQL:', err);
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;