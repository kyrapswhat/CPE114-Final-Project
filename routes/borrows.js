const express = require('express');
const router = express.Router();
const {
  borrowBook,
  returnBook,
  getAllBorrows,
  getBorrowById,
} = require('../controllers/borrowController');

router.get('/', getAllBorrows);
router.get('/:id', getBorrowById);
router.post('/', borrowBook);           // Relationship endpoint: borrow a book
router.put('/:id/return', returnBook);  // Relationship endpoint: return a book

module.exports = router;
