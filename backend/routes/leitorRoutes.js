import express from 'express';
import { registerLeitor, loginLeitor } from '../controllers/leitorController.js';
import { pool } from '../db.js'; // importe sua conexão com o banco

const router = express.Router();

router.post('/register', registerLeitor);
router.post('/login', loginLeitor);

// Rota para obter a lista de espera do leitor
router.get('/:leitorId/lista-espera', async (req, res) => {
  const { leitorId } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM lista_espera WHERE leitor_id = ? ORDER BY data_pedido DESC',
      [leitorId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar lista de espera:', error);
    res.status(500).json({ error: 'Erro ao buscar lista de espera' });
  }
});

export default router;
