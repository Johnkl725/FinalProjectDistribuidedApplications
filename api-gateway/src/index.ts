// ===============================================
// API GATEWAY - MAIN ENTRY POINT
// ===============================================

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { gatewayAuthMiddleware } from './middleware/auth.middleware';
import { rateLimiter } from './middleware/rate-limiter.middleware';
import { requestLogger } from './middleware/logger.middleware';
import {
  authServiceProxy,
  lifeServiceProxy,
  rentServiceProxy,
  vehicleServiceProxy,
} from './config/proxy.config';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// ===============================================
// GLOBAL MIDDLEWARE
// ===============================================
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // HTTP request logger
app.use(requestLogger); // Custom request logger
// Rate limiting: enabled only when RATE_LIMIT_ENABLED is 'true' (case-insensitive)
const rateLimitEnabled = String(process.env.RATE_LIMIT_ENABLED ?? 'true').toLowerCase() === 'true';
if (rateLimitEnabled) {
  app.use(rateLimiter()); // Rate limiting
} else {
  console.log('Rate limiter disabled by RATE_LIMIT_ENABLED=false');
}

// ===============================================
// API GATEWAY ROUTES
// ===============================================

// Root endpoint - API documentation
app.get('/', express.json(), (req: Request, res: Response) => {
  res.json({
    service: 'Insurance Platform API Gateway',
    version: '1.0.0',
    status: 'running',
    documentation: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/me',
      },
      lifeInsurance: {
        quote: 'POST /api/life-insurance/quote',
        createPolicy: 'POST /api/life-insurance/policies',
        myPolicies: 'GET /api/life-insurance/policies/my',
      },
      rentInsurance: {
        quote: 'POST /api/rent-insurance/quote',
        createPolicy: 'POST /api/rent-insurance/policies',
        myPolicies: 'GET /api/rent-insurance/policies/my',
      },
      vehicleInsurance: {
        quote: 'POST /api/vehicle-insurance/quote',
        createPolicy: 'POST /api/vehicle-insurance/policies',
        myPolicies: 'GET /api/vehicle-insurance/policies/my',
      },
    },
    note: 'All endpoints (except /auth/register and /auth/login) require Bearer token authentication',
  });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    service: 'api-gateway',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Status endpoint (detailed)
app.get('/status', (req: Request, res: Response) => {
  res.json({
    success: true,
    gateway: 'healthy',
    services: {
      auth: process.env.AUTH_SERVICE_URL,
      lifeInsurance: process.env.LIFE_SERVICE_URL,
      rentInsurance: process.env.RENT_SERVICE_URL,
      vehicleInsurance: process.env.VEHICLE_SERVICE_URL,
    },
    timestamp: new Date().toISOString(),
  });
});

// ===============================================
// MICROSERVICE ROUTING WITH AUTH
// ===============================================

// Auth Service Routes (public + protected)
app.use('/api/auth', authServiceProxy);

// Protected microservice routes
app.use('/api/life-insurance', gatewayAuthMiddleware, lifeServiceProxy);
app.use('/api/rent-insurance', gatewayAuthMiddleware, rentServiceProxy);
app.use('/api/vehicle-insurance', gatewayAuthMiddleware, vehicleServiceProxy);

// ===============================================
// ERROR HANDLERS
// ===============================================

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
  console.error('❌ Gateway Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal gateway error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    timestamp: new Date().toISOString(),
  });
});

// ===============================================
// START SERVER
// ===============================================
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚪 API GATEWAY STARTED');
  console.log('='.repeat(50));
  console.log(`📡 Listening on port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Gateway URL: http://localhost:${PORT}`);
  console.log('='.repeat(50));
  console.log('📋 Connected Services:');
  console.log(`   🔐 Auth Service: ${process.env.AUTH_SERVICE_URL}`);
  console.log(`   🏥 Life Insurance: ${process.env.LIFE_SERVICE_URL}`);
  console.log(`   🏠 Rent Insurance: ${process.env.RENT_SERVICE_URL}`);
  console.log(`   🚗 Vehicle Insurance: ${process.env.VEHICLE_SERVICE_URL}`);
  console.log('='.repeat(50));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM received, shutting down API Gateway...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('⚠️  SIGINT received, shutting down API Gateway...');
  process.exit(0);
});

export default app;


