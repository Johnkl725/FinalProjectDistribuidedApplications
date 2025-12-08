// ===============================================
// RENT INSURANCE SERVICE - MAIN ENTRY POINT
// ===============================================

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rentInsuranceRoutes from './routes/rent-insurance.routes';
import { getDatabase, errorResponse } from 'shared';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/rent-insurance', rentInsuranceRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Rent Insurance Service',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      quote: 'POST /rent-insurance/quote',
      createPolicy: 'POST /rent-insurance/policies',
      myPolicies: 'GET /rent-insurance/policies/my',
      health: 'GET /rent-insurance/health',
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
      console.log('🏠 Rent Insurance Service started');
      console.log(`📡 Listening on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start rent insurance service:', error);
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


