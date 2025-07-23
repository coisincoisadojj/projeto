const express = require('express');
const { body, validationResult } = require('express-validator');
const { verifyToken } = require('../middlewares/authMiddleware');
const { checkPermission } = require('../middlewares/permissionMiddleware');
const { Book } = require('../models');

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const books = await Book.findAll();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar livros' });
  }
});

router.post('/',
  verifyToken,
  checkPermission('createBook'),
  body('title').isString().notEmpty(),
  body('author').isString().notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, author } = req.body;

    try {
      const newBook = await Book.create({ title, author, available: true });
      res.status(201).json(newBook);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao salvar livro no banco de dados' });
    }
  }
);

router.post('/:id/upload-pdf',
  verifyToken,
  checkPermission('createBook'),
  body('pdfUrl').isURL(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const book = await Book.findByPk(req.params.id);
      if (!book) return res.status(404).json({ error: 'Livro não encontrado' });

      book.pdfUrl = req.body.pdfUrl;
      await book.save();

      res.json({ message: 'PDF vinculado com sucesso', book });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao vincular PDF' });
    }
  }
);

module.exports = router;