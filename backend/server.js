import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';

dotenv.config(); // Certifique-se de que .env existe na raiz e tem JWT_SECRET e PORT

const app = express();

app.use(cors()); // Habilita CORS para todas as origens (pode configurar se quiser)
app.use(express.json()); // Habilita leitura de JSON no body

app.use('/api/auth', authRoutes); // Roteamento para autenticação

// Rota padrão para teste rápido do servidor
app.get('/', (req, res) => {
  res.send('API rodando');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
