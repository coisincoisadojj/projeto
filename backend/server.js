import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import livroRoutes from './routes/livroRoutes.js';
import emprestimoRoutes from './routes/emprestimoRoutes.js';
import { db } from './models/db.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', livroRoutes);
app.use('/api', emprestimoRoutes);

app.get('/', (req, res) => {
  res.send('API rodando');
});

const PORT = process.env.PORT || 5000;

async function testDbConnection() {
  try {
    const connection = await db.getConnection();
    connection.release();
    console.log('Conectado ao banco de dados MySQL');
  } catch (err) {
    console.error('Erro ao conectar ao banco:', err);
  }
}

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  testDbConnection();
});
