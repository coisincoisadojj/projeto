const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const users = [
  { id: 1, email: 'admin@biblioteca.com', passwordHash: bcrypt.hashSync('admin123', 8), role: 'admin' },
  { id: 2, email: 'biblio@biblioteca.com', passwordHash: bcrypt.hashSync('biblio123', 8), role: 'bibliotecario' },
  { id: 3, email: 'user@biblioteca.com', passwordHash: bcrypt.hashSync('user1234', 8), role: 'leitor' },
];

function generateToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user) return res.status(401).json({ error: 'Usuário ou senha inválidos' });

    const passwordIsValid = bcrypt.compareSync(password, user.passwordHash);
    if (!passwordIsValid) return res.status(401).json({ error: 'Usuário ou senha inválidos' });

    const token = generateToken(user);
    return res.json({ token });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token do Google é obrigatório' });

    
    const googleUser = { id: 999, role: 'leitor' };
    const jwtToken = generateToken(googleUser);
    return res.json({ token: jwtToken, message: 'Login via Google OAuth simulado' });
  } catch (error) {
    console.error('Erro no login Google:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
