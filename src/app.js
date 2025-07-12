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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
