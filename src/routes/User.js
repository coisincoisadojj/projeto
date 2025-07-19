const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Middleware de validação
const userValidation = [
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
];

// Rota com validação
router.post('/register', userValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Continue com o cadastro
  res.send('Usuário cadastrado!');
});