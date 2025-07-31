import { pool } from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Listar todos os usuários (leitores e bibliotecários)
export async function listarTodosUsuarios(req, res) {
  try {
    const [leitores] = await pool.query('SELECT id, nome, email, "leitor" AS tipo FROM leitores');
    const [bibliotecarios] = await pool.query('SELECT id, nome, email, "bibliotecario" AS tipo FROM bibliotecarios');
    res.json([...leitores, ...bibliotecarios]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao listar usuários' });
  }
}

export async function listarBibliotecarios(req, res) {
  try {
    const [rows] = await pool.query('SELECT id, nome, email FROM bibliotecarios');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao listar bibliotecários' });
  }
}

export async function listarLivros(req, res) {
  try {
    const [rows] = await pool.query('SELECT id, titulo, autor FROM livros');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao listar livros' });
  }
}

export async function listarEmprestimos(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        e.id, 
        l.id AS livro_id, l.titulo, 
        le.id AS leitor_id, le.nome AS leitor_nome, 
        e.data_emprestimo, e.data_devolucao
      FROM emprestimos e
      JOIN livros l ON e.livro_id = l.id
      JOIN leitores le ON e.leitor_id = le.id
      WHERE e.data_devolucao IS NULL
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao listar empréstimos' });
  }
}

export async function renovarEmprestimo(req, res) {
  const { id } = req.params;
  try {
    const [result] = await pool.query(`
      UPDATE emprestimos
      SET data_devolucao = DATE_ADD(CURDATE(), INTERVAL 7 DAY)
      WHERE id = ? AND data_devolucao IS NULL
    `, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Empréstimo não encontrado ou já devolvido' });
    }

    res.json({ message: 'Empréstimo renovado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao renovar empréstimo' });
  }
}

export async function listarListaEspera(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        le.id AS espera_id, 
        l.id AS livro_id, l.titulo AS livro, 
        r.id AS leitor_id, r.nome AS leitor, 
        le.data_pedido
      FROM lista_espera le
      JOIN livros l ON le.livro_id = l.id
      JOIN leitores r ON le.leitor_id = r.id
      ORDER BY le.data_pedido ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao listar lista de espera' });
  }
}

export async function listarHistoricoLeitura(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        hl.id, 
        le.nome AS leitor_nome, 
        l.titulo AS livro_titulo, 
        hl.data_leitura
      FROM historico_leitura hl
      JOIN leitores le ON hl.leitor_id = le.id
      JOIN livros l ON hl.livro_id = l.id
      ORDER BY hl.data_leitura DESC
      LIMIT 20
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao listar histórico de leitura' });
  }
}

export async function listarLivrosPopulares(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        l.id, l.titulo, COUNT(e.id) AS acessos
      FROM livros l
      LEFT JOIN emprestimos e ON l.id = e.livro_id
      GROUP BY l.id, l.titulo
      ORDER BY acessos DESC
      LIMIT 5
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao listar livros populares' });
  }
}

export async function uploadPdfSimulado(req, res) {
  res.json({ message: 'Upload de PDF simulado recebido.' });
}

// Registro de administrador com bcrypt
export async function registerAdmin(req, res) {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ message: 'Nome, email e senha são obrigatórios' });
  }

  try {
    const hash = await bcrypt.hash(senha, 10);

    const [result] = await pool.query(
      'INSERT INTO admins (nome, email, senha) VALUES (?, ?, ?)',
      [nome, email, hash]
    );

    res.status(201).json({ message: 'Admin registrado com sucesso', id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao registrar admin' });
  }
}

// Login de administrador com bcrypt e JWT
export async function loginAdmin(req, res) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM admins WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const admin = rows[0];
    const match = await bcrypt.compare(senha, admin.senha);

    if (!match) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ id: admin.id, tipo: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: '2h'
    });

    res.json({
      message: 'Login bem-sucedido',
      token,
      admin: { id: admin.id, nome: admin.nome, email: admin.email }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao fazer login' });
  }
}

//
// ✅ NOVAS FUNÇÕES DELETAR
//

// Deletar um leitor por ID
export async function deletarLeitor(req, res) {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM leitores WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Leitor não encontrado' });
    }
    res.json({ message: 'Leitor deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar leitor:', error);
    res.status(500).json({ message: 'Erro ao deletar leitor' });
  }
}

// Deletar um bibliotecário por ID
export async function deletarBibliotecario(req, res) {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM bibliotecarios WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Bibliotecário não encontrado' });
    }
    res.json({ message: 'Bibliotecário deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar bibliotecário:', error);
    res.status(500).json({ message: 'Erro ao deletar bibliotecário' });
  }
}
