/**
 * Express Application Setup
 * Main entry point for the Document Management System API
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet()); // Sets various HTTP headers for security

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Document Management System API is running',
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Centralized Advanced Document Management System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      documents: '/api/documents',
      health: '/health',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large',
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║   Document Management System API                         ║
║   Server running on port ${PORT}                          ║
║   Environment: ${process.env.NODE_ENV || 'development'}                      ║
║   Time: ${new Date().toLocaleString()}            ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  app.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = app;
