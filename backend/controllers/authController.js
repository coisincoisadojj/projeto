import { db } from '../models/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, senha, tipo = 'jogador' } = req.body; // define tipo padrão

  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (rows.length > 0) return res.status(400).json({ message: 'Email já cadastrado' });

    const hash = await bcrypt.hash(senha, 10);

    // Inclui o campo tipo na inserção
    await db.query('INSERT INTO usuarios (email, senha, tipo) VALUES (?, ?, ?)', [email, hash, tipo]);

    res.status(201).json({ message: 'Usuário registrado com sucesso' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao registrar', error: err });
  }
};

export const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(400).json({ message: 'Usuário não encontrado' });

    const usuario = rows[0];
    const match = await bcrypt.compare(senha, usuario.senha);
    if (!match) return res.status(400).json({ message: 'Senha incorreta' });

    // Aqui usa o tipo do usuário vindo do banco
 const token = jwt.sign({ id: usuario.id, tipo: usuario.tipo }, process.env.JWT_SECRET, { expiresIn: '1h' });


    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao fazer login', error: err });
  }
};
