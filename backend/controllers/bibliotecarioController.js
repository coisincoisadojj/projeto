import { pool } from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function registerBibliotecario(req, res) {
  const { nome, email, senha } = req.body;

  try {
    const [rows] = await pool.query('SELECT id FROM bibliotecarios WHERE email = ?', [email]);
    if (rows.length > 0) {
      return res.status(409).json({ message: 'Email já cadastrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashSenha = await bcrypt.hash(senha, salt);

    await pool.query('INSERT INTO bibliotecarios (nome, email, senha) VALUES (?, ?, ?)', [
      nome, email, hashSenha
    ]);

    res.status(201).json({ message: 'Bibliotecário registrado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
}

export async function loginBibliotecario(req, res) {
  const { email, senha } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM bibliotecarios WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const bibliotecario = rows[0];

    const senhaValida = await bcrypt.compare(senha, bibliotecario.senha);
    if (!senhaValida) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: bibliotecario.id, email: bibliotecario.email, tipo: 'bibliotecario' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
}
