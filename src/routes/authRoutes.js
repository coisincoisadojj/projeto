const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// rota de login com google
router.post('/google-login', async (req, res) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: req.body.token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub } = payload;

    const user = { id: sub, email, name, picture };

    const tokenJWT = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login com Google realizado com sucesso!',
      token: tokenJWT,
      user
    });
  } catch (error) {
    console.error('Erro na autenticação com Google:', error);
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
});

module.exports = router;