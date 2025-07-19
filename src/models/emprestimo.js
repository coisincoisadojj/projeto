const mongoose = require('mongoose');

const EmprestimoSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  livro: { type: mongoose.Schema.Types.ObjectId, ref: 'Livro' },
  dataEmprestimo: { type: Date, default: Date.now },
  dataDevolucao: { type: Date }
});

module.exports = mongoose.model('emprestimo', EmprestimoSchema);

const express = require('express');
const router = express.Router();
const emprestimoController = require('../controllers/emprestimoController');

router.get('/emprestimos', emprestimoController.listarEmprestimos);

module.exports = router;
