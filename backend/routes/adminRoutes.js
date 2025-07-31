import express from 'express';
import {
  registerAdmin,
  loginAdmin,
  listarTodosUsuarios,
  listarBibliotecarios,
  listarLivros,
  listarEmprestimos,
  renovarEmprestimo,
  listarListaEspera,
  listarHistoricoLeitura,
  listarLivrosPopulares,
  uploadPdfSimulado,
  deletarLeitor,
  deletarBibliotecario // 👈 ADICIONADO
} from '../controllers/adminController.js';

const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);

router.get('/usuarios', listarTodosUsuarios);
router.get('/bibliotecarios', listarBibliotecarios);
router.get('/livros', listarLivros);
router.get('/emprestimos', listarEmprestimos);
router.post('/emprestimos/:id/renovar', renovarEmprestimo);
router.get('/lista-espera', listarListaEspera);
router.get('/historico-leitura', listarHistoricoLeitura);
router.get('/recomendados', listarLivrosPopulares);
router.post('/upload-pdf', uploadPdfSimulado);

// 🔽 NOVAS ROTAS DE DELETE
router.delete('/leitores/:id', deletarLeitor);
router.delete('/bibliotecarios/:id', deletarBibliotecario);

export default router;
