const { Borrow, Member, Book } = require('../models');

// POST /borrows - Borrow a book (relationship endpoint)
const borrowBook = async (req, res, next) => {
  try {
    const { memberId, bookId, borrowDate } = req.body;
    if (!memberId || !bookId) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'memberId and bookId are required',
      });
    }

    const member = await Member.findByPk(memberId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (book.copiesAvailable < 1) {
      return res.status(400).json({ error: 'No copies available for this book' });
    }

    // Check if member already has this book borrowed
    const existing = await Borrow.findOne({
      where: { memberId, bookId, status: 'borrowed' },
    });
    if (existing) {
      return res.status(400).json({ error: 'Member has already borrowed this book and not returned it' });
    }

    const borrow = await Borrow.create({ memberId, bookId, borrowDate, status: 'borrowed' });
    await book.update({ copiesAvailable: book.copiesAvailable - 1 });

    res.status(201).json({ message: 'Book borrowed successfully', borrow });
  } catch (err) {
    next(err);
  }
};

// PUT /borrows/:id/return - Return a book (relationship endpoint)
const returnBook = async (req, res, next) => {
  try {
    const borrow = await Borrow.findByPk(req.params.id, {
      include: [
        { model: Member, as: 'member' },
        { model: Book, as: 'book' },
      ],
    });

    if (!borrow) {
      return res.status(404).json({ error: 'Borrow record not found' });
    }

    if (borrow.status === 'returned') {
      return res.status(400).json({ error: 'This book has already been returned' });
    }

    const returnDate = req.body.returnDate || new Date().toISOString().split('T')[0];
    await borrow.update({ status: 'returned', returnDate });
    await borrow.book.update({ copiesAvailable: borrow.book.copiesAvailable + 1 });

    res.json({ message: 'Book returned successfully', borrow });
  } catch (err) {
    next(err);
  }
};

// GET /borrows - List all borrow records
const getAllBorrows = async (req, res, next) => {
  try {
    const borrows = await Borrow.findAll({
      include: [
        { model: Member, as: 'member' },
        { model: Book, as: 'book' },
      ],
    });
    res.json(borrows);
  } catch (err) {
    next(err);
  }
};

// GET /borrows/:id - Get single borrow record
const getBorrowById = async (req, res, next) => {
  try {
    const borrow = await Borrow.findByPk(req.params.id, {
      include: [
        { model: Member, as: 'member' },
        { model: Book, as: 'book' },
      ],
    });
    if (!borrow) {
      return res.status(404).json({ error: 'Borrow record not found' });
    }
    res.json(borrow);
  } catch (err) {
    next(err);
  }
};

// GET /members/:memberId/borrows - List all borrows for a member
const getMemberBorrows = async (req, res, next) => {
  try {
    const member = await Member.findByPk(req.params.memberId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    const borrows = await Borrow.findAll({
      where: { memberId: req.params.memberId },
      include: [{ model: Book, as: 'book' }],
    });
    res.json(borrows);
  } catch (err) {
    next(err);
  }
};

module.exports = { borrowBook, returnBook, getAllBorrows, getBorrowById, getMemberBorrows };
