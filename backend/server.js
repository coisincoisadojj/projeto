import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Importação de rotas
import adminRoutes from './routes/adminRoutes.js';
import bibliotecarioRoutes from './routes/bibliotecarioRoutes.js';
import leitorRoutes from './routes/leitorRoutes.js';
import livrosRoutes from './routes/livros.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware para aceitar JSON e permitir CORS
app.use(cors());
app.use(express.json());

// Rotas organizadas por tipo de usuário
app.use('/api/auth/admin', adminRoutes);
app.use('/api/auth/bibliotecario', bibliotecarioRoutes);
app.use('/api/auth/leitor', leitorRoutes);
app.use('/api/auth/livros', livrosRoutes);

// Rota padrão
app.get('/', (req, res) => {
  res.send('API Biblioteca Digital rodando com sucesso!');
});

// Tratamento de erros genérico
app.use((err, req, res, next) => {
  console.error('Erro interno:', err);
  res.status(500).json({ message: 'Erro interno do servidor' });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

// Inicia servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
