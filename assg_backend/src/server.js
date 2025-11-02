import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();

import logger from './config/logger.js';
import connectDB from './config/database.js';
import initializeAdmin from './config/adminInit.js';
import { generalLimiter, authLimiter, apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Import routes
//import apiRoutes from './routes/api.js';
import userRoutes from './routes/userRoutes.js';
import equipRoutes from './routes/equipRoutes.js';
import staffRoutes from './routes/staffRoutes.js';


const app = express();

// Connect to database
connectDB();

// Initialize admin user
initializeAdmin().catch((error) => {
  logger.error('Failed to initialize admin user:', error);
  process.exit(1);
});

// Security middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? ['https://yourdomain.com'] : ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use(morgan('combined', {
  stream: logger.stream,
  skip: (req, res) => res.statusCode < 400 
}));


app.use(generalLimiter);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes with specific rate limiting
//app.use('/api', apiLimiter, apiRoutes);
app.use('/api/auth', userRoutes);
app.use('/api/staff',staffRoutes);
app.use('/api/equip', equipRoutes);
// 404 handler
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

export default app;
