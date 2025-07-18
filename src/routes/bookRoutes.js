const express = require('express');
const { body, validationResult } = require('express-validator');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const Book = require('../models/book');

const router = express.Router();


router.get('/', verifyToken, async (req, res) => {
  const books = await Book.findAll();
  res.json(books);
});


router.post(
  '/',
  verifyToken,
  authorizeRoles('admin', 'bibliotecario'),
  body('title').isString().notEmpty(),
  body('author').isString().notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, author } = req.body;

    try {
      const newBook = await Book.create({ title, author });
      res.status(201).json(newBook);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao criar o livro', error });
    }
  }
);

module.exports = router;