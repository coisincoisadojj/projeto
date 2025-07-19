const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `livro-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

router.post('/upload', upload.single('pdf'), (req, res) => {
  res.json({ file: req.file.filename });
});
