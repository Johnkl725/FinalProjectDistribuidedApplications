// ===============================================
// API GATEWAY - PROXY CONFIGURATION
// ===============================================

import proxy from "express-http-proxy";

/**
 * Service URLs from environment variables
 */
const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || "http://localhost:3001";
const LIFE_SERVICE_URL =
  process.env.LIFE_SERVICE_URL || "http://localhost:3002";
const RENT_SERVICE_URL =
  process.env.RENT_SERVICE_URL || "http://localhost:3003";
const VEHICLE_SERVICE_URL =
  process.env.VEHICLE_SERVICE_URL || "http://localhost:3004";
const CLAIMS_SERVICE_URL =
  process.env.CLAIMS_SERVICE_URL || "http://localhost:3005";
const RENEWAL_SERVICE_URL =
  process.env.RENEWAL_SERVICE_URL || "http://localhost:3006";

/**
 * Auth Service Proxy
 */
export const authServiceProxy = proxy(AUTH_SERVICE_URL, {
  proxyReqPathResolver: (req) => {
    // req.url viene como /health, /register, /login después de que Express procesa /api/auth
    const path = "/auth" + req.url;
    console.log(`🔄 Proxying to Auth Service: ${req.method} ${path}`);
    return path;
  },
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    console.log(`📤 Request headers:`, proxyReqOpts.headers);
    return proxyReqOpts;
  },
  userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
    console.log(`✅ Auth Service response: ${userRes.statusCode}`);
    return proxyResData;
  },
});

/**
 * Life Insurance Service Proxy
 */
export const lifeServiceProxy = proxy(LIFE_SERVICE_URL, {
  proxyReqPathResolver: (req) => {
    const path = "/life-insurance" + req.url;
    console.log(`🔄 Proxying to Life Insurance Service: ${req.method} ${path}`);
    return path;
  },
});

/**
 * Rent Insurance Service Proxy
 */
export const rentServiceProxy = proxy(RENT_SERVICE_URL, {
  proxyReqPathResolver: (req) => {
    const path = "/rent-insurance" + req.url;
    console.log(`🔄 Proxying to Rent Insurance Service: ${req.method} ${path}`);
    return path;
  },
});

/**
 * Vehicle Insurance Service Proxy
 */
export const vehicleServiceProxy = proxy(VEHICLE_SERVICE_URL, {
  proxyReqPathResolver: (req) => {
    const path = "/vehicle-insurance" + req.url;
    console.log(
      `🔄 Proxying to Vehicle Insurance Service: ${req.method} ${path}`
    );
    return path;
  },
});

/**
 * Claims Service Proxy
 */
export const claimsServiceProxy = proxy(CLAIMS_SERVICE_URL, {
  proxyReqPathResolver: (req) => {
    const path = "/claims" + req.url;
    console.log(`🔄 Proxying to Claims Service: ${req.method} ${path}`);
    return path;
  },
});

/**
 * Renewal Service Proxy
 */
export const renewalServiceProxy = proxy(RENEWAL_SERVICE_URL, {
  proxyReqPathResolver: (req) => {
    const path = "/renewals" + req.url;
    console.log(`🔄 Proxying to Renewal Service: ${req.method} ${path}`);
    return path;
  },
});
