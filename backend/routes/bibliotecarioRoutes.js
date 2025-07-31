import express from 'express';
import { registerBibliotecario, loginBibliotecario } from '../controllers/bibliotecarioController.js';

const router = express.Router();

router.post('/register', registerBibliotecario);
router.post('/login', loginBibliotecario);  // Rota de login adicionada

export default router;
