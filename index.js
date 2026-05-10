require('dotenv').config();
const express = require('express');
const sequelize = require('./config/database');

// Import models to register associations
require('./models/index');

// Import middleware
const logger = require('./middleware/logger');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authorRoutes = require('./routes/authors');
const bookRoutes = require('./routes/books');
const memberRoutes = require('./routes/members');
const borrowRoutes = require('./routes/borrows');

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsing
app.use(express.json());

// Custom logger middleware
app.use(logger);

// Routes
app.use('/api/authors', authorRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/borrows', borrowRoutes);

// Root health check
app.get('/', (req, res) => {
  res.json({ message: 'Library API is running', version: '1.0.0' });
});

// 404 catch-all (must be after all routes)
app.use(notFound);

// Global error handler (must be last, 4 params)
app.use(errorHandler);

// Sync database and start server
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('Database synced successfully.');
    app.listen(PORT, () => {
      console.log(`Library API server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err.message);
    process.exit(1);
  });
