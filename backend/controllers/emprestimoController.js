import { db } from '../models/db.js';

export const criarEmprestimo = async (req, res) => {
  const userId = req.user.id; // pegue o id do usuário do token
  const { livroId } = req.body;

  if (!livroId) {
    return res.status(400).json({ message: 'Livro não informado' });
  }

  try {
    // Exemplo: cria empréstimo com prazo de 7 dias (pode ajustar conforme quiser)
    const prazoDevolucao = new Date();
    prazoDevolucao.setDate(prazoDevolucao.getDate() + 7);

    await db.query(
      'INSERT INTO emprestimos (id_usuario, id_livro, data_emprestimo, prazo_devolucao) VALUES (?, ?, NOW(), ?)',
      [userId, livroId, prazoDevolucao]
    );

    res.status(201).json({ message: 'Empréstimo realizado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao realizar empréstimo' });
  }
};

export const listarEmprestimosUsuario = async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await db.query(
      `SELECT e.id, e.data_emprestimo, e.prazo_devolucao, l.titulo, l.autor
       FROM emprestimos e
       JOIN livros l ON e.id_livro = l.id
       WHERE e.id_usuario = ?`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao listar empréstimos' });
  }
};
