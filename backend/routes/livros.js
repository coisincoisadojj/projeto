import express from 'express';
import multer from 'multer';
import { pool } from '../db.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

/** ================================
 * ROTAS DE LIVROS
 * ================================ */

// Listar todos os livros (incluindo imagem em base64 se existir)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM livros');
    const livrosComImagemBase64 = rows.map((livro) => {
      if (livro.imagem) {
        const base64 = livro.imagem.toString('base64');
        return {
          ...livro,
          imagem: `data:${livro.imagem_tipo};base64,${base64}`,
        };
      }
      return livro;
    });
    res.json(livrosComImagemBase64);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cadastrar novo livro com imagem opcional
router.post('/', upload.single('imagem'), async (req, res) => {
  try {
    const titulo = req.body?.titulo?.trim();
    const autor = req.body?.autor?.trim();
    if (!titulo || !autor) return res.status(400).json({ error: 'Preencha título e autor' });

    const [existente] = await pool.query(
      'SELECT * FROM livros WHERE titulo = ? AND autor = ?',
      [titulo, autor]
    );
    if (existente.length > 0) return res.status(409).json({ error: 'Livro já cadastrado' });

    const imagemBuffer = req.file ? req.file.buffer : null;
    const imagemMimeType = req.file ? req.file.mimetype : null;

    const query = `
      INSERT INTO livros (titulo, autor, disponivel, popularidade, imagem, imagem_tipo)
      VALUES (?, ?, true, 0, ?, ?)
    `;
    const [result] = await pool.query(query, [titulo, autor, imagemBuffer, imagemMimeType]);

    res.status(201).json({
      id: result.insertId,
      titulo,
      autor,
      disponivel: true,
      popularidade: 0,
      temImagem: !!imagemBuffer,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar PDF do livro
router.put('/:id/pdf', async (req, res) => {
  const livroId = req.params.id;
  const { pdf } = req.body;
  if (!pdf) return res.status(400).json({ error: 'Nome do PDF é obrigatório' });

  try {
    const [result] = await pool.query('UPDATE livros SET pdf = ? WHERE id = ?', [pdf, livroId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Livro não encontrado' });

    res.json({ message: 'PDF atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Emprestar livro para leitor
router.post('/:id/emprestar', async (req, res) => {
  const livroId = req.params.id;
  const { leitor_id } = req.body;
  if (!leitor_id) return res.status(400).json({ error: 'ID do leitor é obrigatório' });

  try {
    const [livroRows] = await pool.query('SELECT * FROM livros WHERE id = ?', [livroId]);
    if (livroRows.length === 0) return res.status(404).json({ error: 'Livro não encontrado' });

    if (!livroRows[0].disponivel) {
      // Já está na lista de espera?
      const [jaNaLista] = await pool.query(
        'SELECT * FROM lista_espera WHERE livro_id = ? AND leitor_id = ?',
        [livroId, leitor_id]
      );
      if (jaNaLista.length > 0) {
        return res.status(400).json({ error: 'Você já está na lista de espera deste livro.' });
      }

      await pool.query(
        'INSERT INTO lista_espera (livro_id, leitor_id, data_pedido) VALUES (?, ?, NOW())',
        [livroId, leitor_id]
      );
      return res.status(200).json({ message: 'Livro indisponível. Você entrou na lista de espera.' });
    }

    // Atualiza livro para indisponível e incrementa popularidade
    await pool.query('UPDATE livros SET disponivel = false, popularidade = popularidade + 1 WHERE id = ?', [livroId]);

    // Insere novo empréstimo com prazo de 7 dias
    await pool.query(
      'INSERT INTO emprestimos (livro_id, leitor_id, data_emprestimo, data_devolucao, devolvido) VALUES (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY), false)',
      [livroId, leitor_id]
    );

    // Remove o leitor da lista de espera desse livro, se estiver nela
    await pool.query(
      'DELETE FROM lista_espera WHERE livro_id = ? AND leitor_id = ?',
      [livroId, leitor_id]
    );

    res.json({ message: 'Livro emprestado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Entrar explicitamente na lista de espera do livro
router.post('/:id/lista-espera', async (req, res) => {
  const livroId = req.params.id;
  const { leitor_id } = req.body;

  if (!leitor_id) return res.status(400).json({ error: 'ID do leitor é obrigatório' });

  try {
    const [livro] = await pool.query('SELECT * FROM livros WHERE id = ?', [livroId]);
    if (livro.length === 0) return res.status(404).json({ error: 'Livro não encontrado' });

    const [jaNaLista] = await pool.query(
      'SELECT * FROM lista_espera WHERE livro_id = ? AND leitor_id = ?',
      [livroId, leitor_id]
    );
    if (jaNaLista.length > 0) {
      return res.status(400).json({ error: 'Você já está na lista de espera deste livro.' });
    }

    await pool.query(
      'INSERT INTO lista_espera (livro_id, leitor_id, data_pedido) VALUES (?, ?, NOW())',
      [livroId, leitor_id]
    );

    res.status(201).json({ message: 'Adicionado à lista de espera com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** ================================
 * ROTAS DE HISTÓRICO E LISTA DE ESPERA
 * ================================ */

// Histórico do leitor (inclui devolvidos)
router.get('/historico/:leitor_id', async (req, res) => {
  const leitorId = req.params.leitor_id;
  try {
    const [rows] = await pool.query(`
      SELECT e.id, l.titulo, l.autor, e.data_emprestimo, e.data_devolucao, e.devolvido
      FROM emprestimos e
      JOIN livros l ON e.livro_id = l.id
      WHERE e.leitor_id = ?
      ORDER BY e.data_emprestimo DESC
    `, [leitorId]);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lista de espera do livro
router.get('/:id/lista-espera', async (req, res) => {
  const livroId = req.params.id;
  try {
    const [rows] = await pool.query(`
      SELECT le.id, le.leitor_id, u.nome AS leitor_nome, le.data_pedido
      FROM lista_espera le
      JOIN leitores u ON le.leitor_id = u.id
      WHERE le.livro_id = ?
      ORDER BY le.data_pedido ASC
    `, [livroId]);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remover da lista de espera
router.delete('/lista-espera/:id', async (req, res) => {
  const esperaId = req.params.id;
  try {
    const [resultado] = await pool.query('DELETE FROM lista_espera WHERE id = ?', [esperaId]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    res.json({ message: 'Removido da lista de espera com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/** ================================
 * ROTA PARA DEVOLVER EMPRÉSTIMO
 * ================================ */

// Atualizar empréstimo para devolvido e liberar livro
router.put('/emprestimos/:id/devolver', async (req, res) => {
  const emprestimoId = req.params.id;

  try {
    const [emprestimos] = await pool.query('SELECT * FROM emprestimos WHERE id = ?', [emprestimoId]);
    if (emprestimos.length === 0) {
      return res.status(404).json({ error: 'Empréstimo não encontrado' });
    }
    const emprestimo = emprestimos[0];

    await pool.query(`
      UPDATE emprestimos
      SET devolvido = TRUE, data_devolucao = CURDATE()
      WHERE id = ?
    `, [emprestimoId]);

    await pool.query('UPDATE livros SET disponivel = true WHERE id = ?', [emprestimo.livro_id]);

    res.json({ message: 'Empréstimo devolvido e livro liberado com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/** ================================
 * ROTAS ADMIN
 * ================================ */

// Listar empréstimos ativos (não devolvidos)
router.get('/admin/emprestimos', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT e.id, e.livro_id, e.leitor_id, e.data_emprestimo, e.data_devolucao, e.renovado,
             l.titulo AS livro_titulo, le.nome AS leitor_nome
      FROM emprestimos e
      JOIN livros l ON e.livro_id = l.id
      JOIN leitores le ON e.leitor_id = le.id
      WHERE e.devolvido = FALSE
      ORDER BY e.data_emprestimo DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Renovar empréstimo
router.post('/admin/emprestimos/:id/renovar', async (req, res) => {
  const id = req.params.id;
  try {
    const [emprestimo] = await pool.query('SELECT renovado FROM emprestimos WHERE id = ?', [id]);
    if (!emprestimo.length) return res.status(404).json({ error: 'Empréstimo não encontrado' });
    if (emprestimo[0].renovado) return res.status(400).json({ error: 'Empréstimo já foi renovado uma vez' });

    await pool.query(`
      UPDATE emprestimos 
      SET data_devolucao = DATE_ADD(data_devolucao, INTERVAL 7 DAY),
          renovado = 1
      WHERE id = ?
    `, [id]);

    res.json({ message: 'Empréstimo renovado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listar leitores
router.get('/admin/leitores', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nome, email FROM leitores');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listar bibliotecários
router.get('/admin/bibliotecarios', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nome, email FROM bibliotecarios');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listar todos os usuários (leitores e bibliotecários)
router.get('/admin/usuarios', async (req, res) => {
  try {
    const [leitores] = await pool.query('SELECT id, nome, email, "leitor" AS tipo FROM leitores');
    const [bibliotecarios] = await pool.query('SELECT id, nome, email, "bibliotecario" AS tipo FROM bibliotecarios');
    res.json([...leitores, ...bibliotecarios]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar leitor
router.delete('/admin/leitores/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [result] = await pool.query('DELETE FROM leitores WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Leitor não encontrado' });
    res.json({ message: 'Leitor deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar bibliotecário
router.delete('/admin/bibliotecarios/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [result] = await pool.query('DELETE FROM bibliotecarios WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Bibliotecário não encontrado' });
    res.json({ message: 'Bibliotecário deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para listar histórico completo de empréstimos (admin)
router.get('/admin/historico', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT e.id, l.titulo, le.nome AS leitor_nome, e.data_emprestimo, e.data_devolucao, e.devolvido
      FROM emprestimos e
      JOIN livros l ON e.livro_id = l.id
      JOIN leitores le ON e.leitor_id = le.id
      ORDER BY e.data_emprestimo DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar popularidade dos livros com base no número de empréstimos
router.post('/admin/atualizar-popularidade', async (req, res) => {
  try {
    // Zera a popularidade de todos os livros
    await pool.query('UPDATE livros SET popularidade = 0');

    // Atualiza com base na contagem de empréstimos
    await pool.query(`
      UPDATE livros l
      JOIN (
        SELECT livro_id, COUNT(*) AS total
        FROM emprestimos
        GROUP BY livro_id
      ) e ON l.id = e.livro_id
      SET l.popularidade = e.total
    `);

    res.json({ message: 'Popularidade dos livros atualizada com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Recomendar livros para um leitor com base nos livros já lidos e popularidade
router.get('/recomendacoes/:leitor_id', async (req, res) => {
  const leitorId = req.params.leitor_id;

  try {
    // Livros que o leitor já leu (devolveu)
    const [livrosLidos] = await pool.query(`
      SELECT DISTINCT livro_id
      FROM emprestimos
      WHERE leitor_id = ? AND devolvido = TRUE
    `, [leitorId]);

    const idsLidos = livrosLidos.map((l) => l.livro_id);
    const placeholders = idsLidos.length ? idsLidos.map(() => '?').join(',') : 'NULL';

    // Recomendação: livros mais populares que ele ainda não leu
    const [recomendacoes] = await pool.query(`
      SELECT id, titulo, autor, popularidade, imagem, imagem_tipo
      FROM livros
      WHERE id NOT IN (${placeholders})
      ORDER BY popularidade DESC
      LIMIT 5
    `, idsLidos);

    // Se tiver imagem, transformar em base64
    const recomendacoesComImagem = recomendacoes.map((livro) => {
      if (livro.imagem) {
        const base64 = livro.imagem.toString('base64');
        return {
          ...livro,
          imagem: `data:${livro.imagem_tipo};base64,${base64}`,
        };
      }
      return livro;
    });

    res.json(recomendacoesComImagem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
