import { pool } from '../db.js';
import bcrypt from 'bcryptjs';

export async function registerUser(req, res) {
  const { nome, email, senha, tipo } = req.body;

  // validar tipo
  const tiposValidos = ['admin', 'bibliotecario', 'leitor'];
  if (!tiposValidos.includes(tipo)) {
    return res.status(400).json({ message: 'Tipo de usuário inválido' });
  }

  try {
    // Verificar se email já existe
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      return res.status(409).json({ message: 'Email já cadastrado' });
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashSenha = await bcrypt.hash(senha, salt);

    // Inserir usuário no banco
    await pool.query(
      'INSERT INTO users (nome, email, senha, role) VALUES (?, ?, ?, ?)',
      [nome, email, hashSenha, tipo]
    );

    return res.status(201).json({ message: 'Usuário registrado com sucesso' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro no servidor' });
  }
}
