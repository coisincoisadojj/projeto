const express = require('express');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { body, validationResult } = require('express-validator');

const router = express.Router();


let loans = []; 
let waitlist = {}; 
const books = [
  { id: 1, title: 'Livro A', author: 'Autor A' },
  { id: 2, title: 'Livro B', author: 'Autor B' },
  
];


router.post('/',
  verifyToken,
  authorizeRoles('leitor', 'bibliotecario'),
  body('bookId').isInt(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { bookId } = req.body;
    const loan = {
      id: loans.length + 1,
      userId: req.user.id,
      bookId,
      borrowedAt: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
      returned: false
    };
    loans.push(loan);
    res.status(201).json(loan);
  }
);


router.patch('/:id/return',
  verifyToken,
  authorizeRoles('leitor', 'bibliotecario'),
  (req, res) => {
    const loan = loans.find(l => l.id === parseInt(req.params.id));
    if (!loan) return res.status(404).json({ error: 'Empréstimo não encontrado' });
    if (loan.userId !== req.user.id && req.user.role === 'leitor')
      return res.status(403).json({ error: 'Sem permissão para devolver este livro' });

    loan.returned = true;
    loan.returnedAt = new Date();
    res.json({ message: 'Livro devolvido', loan });
  }
);


router.post('/waitlist',
  verifyToken,
  authorizeRoles('leitor'),
  body('bookId').isInt(),
  (req, res) => {
    const { bookId } = req.body;
    if (!waitlist[bookId]) waitlist[bookId] = [];

    if (!waitlist[bookId].includes(req.user.id)) {
      waitlist[bookId].push(req.user.id);
    }

    res.status(201).json({ message: 'Adicionado à lista de espera', fila: waitlist[bookId] });
  }
);


router.get('/history',
  verifyToken,
  (req, res) => {
    const history = loans.filter(l => l.userId === req.user.id && l.returned);
    res.json(history);
  }
);


router.get('/recommendations',
  verifyToken,
  (req, res) => {
    const userLoans = loans.filter(l => l.userId === req.user.id && l.returned);
    const readBookIds = userLoans.map(l => l.bookId);
    const readBooks = books.filter(b => readBookIds.includes(b.id));
    const authors = [...new Set(readBooks.map(b => b.author))];

    const recommendations = books.filter(b =>
      authors.includes(b.author) && !readBookIds.includes(b.id)
    );

    res.json({ recommendations });
  }
);

module.exports = router;
