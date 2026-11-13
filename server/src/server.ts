import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import emergencyRoutes from './routes/emergencyRoutes.js';
import guardianRoutes from './routes/guardianRoutes.js';
import journeyRoutes from './routes/journeyRoutes.js';
import safePlaceRoutes from './routes/safePlaceRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// CORS Configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request Logger (Development)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health & System Info Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    name: 'SafeHer API Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      database: config.supabase.isConfigured ? 'Supabase (Connected)' : 'Local Resilient Store (Active)',
      geminiAi: config.gemini.isConfigured ? 'Google Gemini API (Active)' : 'SafeHer Built-in Safety Engine',
      realtime: 'Active',
    }
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/guardians', guardianRoutes);
app.use('/api/journey', journeyRoutes);
app.use('/api/safe-places', safePlaceRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handler
app.use(errorHandler);

// Start Server
const server = app.listen(config.port, () => {
  console.log(`=======================================================`);
  console.log(`  🛡️  SafeHer Backend Server Running on Port ${config.port}`);
  console.log(`  🚀  URL: http://localhost:${config.port}`);
  console.log(`  🔐  Supabase Mode: ${config.supabase.isConfigured ? 'LIVE SUPABASE' : 'RESILIENT HYBRID STORE'}`);
  console.log(`  ✨  Gemini AI Mode: ${config.gemini.isConfigured ? 'LIVE GEMINI API' : 'OFFLINE SAFETY ENGINE'}`);
  console.log(`=======================================================`);
});

export default app;

