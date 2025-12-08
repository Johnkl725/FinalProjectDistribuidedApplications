// ===============================================
// CLAIMS SERVICE - MAIN ENTRY POINT
// ===============================================

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import claimRoutes from './routes/claim.routes';
import { getDatabase } from '../../shared/src/database/connection';
import { errorResponse } from '../../shared/src/utils/api-response';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/claims', claimRoutes);

// Direct health check endpoint (without /claims prefix)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Claims Service',
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Claims Service',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      createClaim: 'POST /claims',
      myClaims: 'GET /claims/my',
      getClaim: 'GET /claims/:claimNumber',
      updateStatus: 'PUT /claims/:id/status',
      health: 'GET /claims/health',
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
    const db = getDatabase();
    const isConnected = await db.testConnection();

    if (!isConnected) {
      throw new Error('Failed to connect to database');
    }

    app.listen(PORT, () => {
      console.log('📋 Claims Service started');
      console.log(`📡 Listening on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start claims service:', error);
    process.exit(1);
  }
}

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

startServer();

export default app;

