import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { db } from '../models/db.js';

const router = express.Router();

router.post('/emprestimos', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { livroId } = req.body;

  if (!livroId) {
    return res.status(400).json({ message: 'Livro não informado' });
  }

  try {
    const prazoDevolucao = new Date();
    prazoDevolucao.setDate(prazoDevolucao.getDate() + 7);

    await db.query(
      'INSERT INTO emprestimos (usuario_id, livro_id, data_emprestimo, prazo_devolucao) VALUES (?, ?, CURDATE(), ?)',
      [userId, livroId, prazoDevolucao]
    );

    res.status(201).json({ message: 'Empréstimo realizado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao realizar empréstimo' });
  }
});

router.get('/emprestimos', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(
      `SELECT e.id, e.data_emprestimo, e.prazo_devolucao, l.titulo, l.autor
       FROM emprestimos e
       JOIN livros l ON e.livro_id = l.id
       WHERE e.usuario_id = ?`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao listar empréstimos' });
  }
});

export default router;
