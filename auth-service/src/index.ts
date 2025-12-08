// ===============================================
// AUTH SERVICE - MAIN ENTRY POINT
// ===============================================

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import { getDatabase, errorResponse } from 'shared';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // HTTP request logger

// Routes
app.use('/auth', authRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Auth Service',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      register: 'POST /auth/register',
      login: 'POST /auth/login',
      profile: 'GET /auth/me',
      health: 'GET /auth/health',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json(errorResponse('Endpoint not found'));
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Error:', err);
  res.status(500).json(errorResponse('Internal server error'));
});

// Start server
async function startServer() {
  try {
    // Test database connection
    const db = getDatabase();
    const isConnected = await db.testConnection();

    if (!isConnected) {
      throw new Error('Failed to connect to database');
    }

    // Start listening
    app.listen(PORT, () => {
      console.log('🚀 Auth Service started');
      console.log(`📡 Listening on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start auth service:', error);
    process.exit(1);
  }
}

// Handle shutdown gracefully
process.on('SIGTERM', async () => {
  console.log('⚠️  SIGTERM received, shutting down gracefully...');
  const db = getDatabase();
  await db.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('⚠️  SIGINT received, shutting down gracefully...');
  const db = getDatabase();
  await db.close();
  process.exit(0);
});

// Start the server
startServer();

export default app;


