const express = require('express');
const { body, validationResult } = require('express-validator');
const { verifyToken } = require('../middlewares/authMiddleware');
const { checkPermission } = require('../middlewares/permissionMiddleware');

const router = express.Router();

let books = [
  { id: 1, title: 'Livro A', author: 'Autor A' },
  { id: 2, title: 'Livro B', author: 'Autor B' },
];

let loans = [];

let waitlists = {};

let readingHistory = {};




router.get('/', verifyToken, (req, res) => {
  res.json(books);
});

router.post('/',
  verifyToken,
  checkPermission('createBook'),
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

router.post('/:id/upload-pdf',
  verifyToken,
  checkPermission('createBook'),
  body('pdfUrl').isURL(),
  (req, res) => {
    const book = books.find(b => b.id === parseInt(req.params.id));
    if (!book) return res.status(404).json({ error: 'Livro não encontrado' });

    book.pdfUrl = req.body.pdfUrl;
    res.json({ message: 'PDF vinculado com sucesso', book });
  }
);

router.post('/:id/borrow',
  verifyToken,
  checkPermission('borrowBook'),
  (req, res) => {
    const bookId = parseInt(req.params.id);
    const userId = req.user.id;

    const book = books.find(b => b.id === bookId);
    if (!book) return res.status(404).json({ error: 'Livro não encontrado' });

    const activeLoan = loans.find(l => l.bookId === bookId && l.status === 'borrowed');
    if (activeLoan) {
      waitlists[bookId] = waitlists[bookId] || [];
      if (waitlists[bookId].includes(userId)) {
        return res.status(400).json({ error: 'Você já está na lista de espera para este livro' });
      }
      waitlists[bookId].push(userId);
      return res.json({ message: 'Livro indisponível, você foi adicionado à lista de espera' });
    }

    const startDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(startDate.getDate() + 7);

    loans.push({ userId, bookId, startDate, dueDate, status: 'borrowed' });

    readingHistory[userId] = readingHistory[userId] || [];
    readingHistory[userId].push({ bookId, date: startDate });

    res.json({ message: 'Empréstimo realizado com sucesso', dueDate });
  }
);

router.post('/:id/renew',
  verifyToken,
  checkPermission('renewLoan'),
  (req, res) => {
    const bookId = parseInt(req.params.id);

    const loan = loans.find(l => l.bookId === bookId && l.status === 'borrowed');
    if (!loan) return res.status(404).json({ error: 'Empréstimo não encontrado' });

    loan.dueDate.setDate(loan.dueDate.getDate() + 7);
    res.json({ message: 'Empréstimo renovado', newDueDate: loan.dueDate });
  }
);

router.post('/:id/return',
  verifyToken,
  checkPermission('returnBook'),
  (req, res) => {
    const bookId = parseInt(req.params.id);
    const userId = req.user.id;

    const loan = loans.find(l => l.bookId === bookId && l.userId === userId && l.status === 'borrowed');
    if (!loan) return res.status(404).json({ error: 'Empréstimo não encontrado para este usuário' });

    loan.status = 'returned';

    if (waitlists[bookId] && waitlists[bookId].length > 0) {
      const nextUserId = waitlists[bookId].shift();
      console.log(`Notificação: Usuário ${nextUserId} pode pegar o livro ${bookId} agora.`);
    }

    res.json({ message: 'Livro devolvido com sucesso' });
  }
);

router.get('/history',
  verifyToken,
  (req, res) => {
    const userId = req.user.id;
    const history = readingHistory[userId] || [];
    res.json(history);
  }
);

router.get('/recommendations',
  verifyToken,
  (req, res) => {
    const userId = req.user.id;
    const history = readingHistory[userId] || [];

    const authorsRead = new Set();
    history.forEach(h => {
      const book = books.find(b => b.id === h.bookId);
      if (book) authorsRead.add(book.author);
    });

    const recommended = books.filter(b =>
      authorsRead.has(b.author) &&
      !history.some(h => h.bookId === b.id)
    );

    res.json(recommended);
  }
);

module.exports = router;
