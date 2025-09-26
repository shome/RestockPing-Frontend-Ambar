import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

// Import routes
import adminRoutes from './routes/admin';
import teamRoutes from './routes/team';
import publicRoutes from './routes/public';
import webhookRoutes from './routes/webhooks';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize Prisma Client
export const prisma = new PrismaClient();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: 'connected',
          response_time_ms: 0,
          error: null,
        },
        sms_provider: {
          status: process.env.TWILIO_ACCOUNT_SID ? 'configured' : 'not_configured',
          configured: !!process.env.TWILIO_ACCOUNT_SID,
          error: null,
        },
        api: {
          status: 'running',
          uptime_seconds: process.uptime(),
        },
      },
      overall_health: 100,
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: 'error',
          response_time_ms: 0,
          error: 'Database connection failed',
        },
        sms_provider: {
          status: process.env.TWILIO_ACCOUNT_SID ? 'configured' : 'not_configured',
          configured: !!process.env.TWILIO_ACCOUNT_SID,
          error: null,
        },
        api: {
          status: 'running',
          uptime_seconds: process.uptime(),
        },
      },
      overall_health: 0,
    });
  }
});

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/team', teamRoutes);
app.use('/api', publicRoutes);
app.use('/api/webhooks', webhookRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(port, () => {
  logger.info(`RestockPing Backend running on port ${port}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
  await prisma.$disconnect();
});

export default app;
