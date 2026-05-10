const Author = require('./Author');
const Book = require('./Book');
const Member = require('./Member');
const Borrow = require('./Borrow');

// One-to-Many: Author has many Books; Book belongs to Author
Author.hasMany(Book, { foreignKey: 'authorId', as: 'books', onDelete: 'CASCADE' });
Book.belongsTo(Author, { foreignKey: 'authorId', as: 'author' });

// Many-to-Many: Members borrow many Books through Borrow
Member.belongsToMany(Book, { through: Borrow, foreignKey: 'memberId', as: 'borrowedBooks' });
Book.belongsToMany(Member, { through: Borrow, foreignKey: 'bookId', as: 'borrowers' });

// Direct associations for Borrow model
Borrow.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });
Borrow.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });
Member.hasMany(Borrow, { foreignKey: 'memberId', as: 'borrows' });
Book.hasMany(Borrow, { foreignKey: 'bookId', as: 'borrows' });

module.exports = { Author, Book, Member, Borrow };
