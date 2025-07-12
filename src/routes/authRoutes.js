const express = require('express');
console.log("✅ Arquivo authRoutes carregado com sucesso");
const { body, validationResult } = require('express-validator');
const AuthController = require('../controllers/authController');

const router = express.Router();

router.post('/login',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  (req, res, next) => {
    console.log('Requisição POST /auth/login recebida'); // <-- linha adicionada
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  AuthController.login
);

router.post('/google',
  body('token').notEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  AuthController.googleLogin
);

module.exports = router;
