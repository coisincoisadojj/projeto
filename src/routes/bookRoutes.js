const express = require('express');
const { body, validationResult } = require('express-validator');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

let books = [
  { id: 1, title: 'Livro A', author: 'Autor A' },
  { id: 2, title: 'Livro B', author: 'Autor B' },
];


router.get('/', verifyToken, (req, res) => {
  res.json(books);
});


router.post('/',
  verifyToken,
  authorizeRoles('admin', 'bibliotecario'),
  body('title').isString().notEmpty(),
  body('author').isString().notEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  (req, res) => {
    const { title, author } = req.body;
    const newBook = { id: books.length + 1, title, author };
    books.push(newBook);
    res.status(201).json(newBook);
  }
);

module.exports = router;
