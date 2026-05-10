const { Book, Author, Member, Borrow } = require('../models');

// GET /books
const getAllBooks = async (req, res, next) => {
  try {
    const books = await Book.findAll({
      include: [{ model: Author, as: 'author' }],
    });
    res.json(books);
  } catch (err) {
    next(err);
  }
};

// GET /books/:id
const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id, {
      include: [
        { model: Author, as: 'author' },
        { model: Member, as: 'borrowers', through: { attributes: ['borrowDate', 'returnDate', 'status'] } },
      ],
    });
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(book);
  } catch (err) {
    next(err);
  }
};

// POST /books
const createBook = async (req, res, next) => {
  try {
    const { title, isbn, publishedYear, copiesAvailable, authorId } = req.body;
    if (!title || !isbn || !authorId) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'title, isbn, and authorId are required',
      });
    }
    const author = await Author.findByPk(authorId);
    if (!author) {
      return res.status(400).json({ error: 'Validation error', message: 'authorId does not exist' });
    }
    const book = await Book.create({ title, isbn, publishedYear, copiesAvailable, authorId });
    res.status(201).json(book);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Validation error', message: 'isbn must be unique' });
    }
    next(err);
  }
};

// PUT /books/:id
const updateBook = async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    const { title, isbn, publishedYear, copiesAvailable, authorId } = req.body;
    await book.update({ title, isbn, publishedYear, copiesAvailable, authorId });
    res.json(book);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Validation error', message: 'isbn must be unique' });
    }
    next(err);
  }
};

// DELETE /books/:id
const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    await book.destroy();
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllBooks, getBookById, createBook, updateBook, deleteBook };
