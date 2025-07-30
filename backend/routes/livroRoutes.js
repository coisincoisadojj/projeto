import express from 'express';
import {
  listarLivros,
  adicionarLivro,
  atualizarLivro,
  deletarLivro
} from '../controllers/livroController.js';

import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rotas protegidas por autenticação
router.get('/', authenticateToken, listarLivros);
router.post('/', authenticateToken, adicionarLivro);
router.put('/:id', authenticateToken, atualizarLivro);
router.delete('/:id', authenticateToken, deletarLivro);

export default router;
