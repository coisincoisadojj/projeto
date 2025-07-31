import { pool } from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function registerLeitor(req, res) {
  const { nome, email, senha } = req.body;

  // Validação simples de entrada
  if (!nome || !email || !senha) {
    return res.status(400).json({ message: 'Nome, email e senha são obrigatórios' });
  }

  try {
    const [rows] = await pool.query('SELECT id FROM leitores WHERE email = ?', [email]);
    if (rows.length > 0) {
      return res.status(409).json({ message: 'Email já cadastrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashSenha = await bcrypt.hash(senha, salt);

    await pool.query('INSERT INTO leitores (nome, email, senha) VALUES (?, ?, ?)', [
      nome,
      email,
      hashSenha,
    ]);

    res.status(201).json({ message: 'Leitor registrado com sucesso' });
  } catch (error) {
    console.error('Erro no registerLeitor:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
}

export async function loginLeitor(req, res) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM leitores WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const leitor = rows[0];

    const senhaValida = await bcrypt.compare(senha, leitor.senha);
    if (!senhaValida) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET não definido no .env');
      return res.status(500).json({ message: 'Erro no servidor' });
    }

    const token = jwt.sign(
      { id: leitor.id, email: leitor.email, tipo: 'leitor' },
      jwtSecret,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Erro no loginLeitor:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
}
