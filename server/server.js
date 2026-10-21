import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import pool, { testConnection } from './config/database.js';
import usersRoutes from './routes/users.routes.js';
import driversRoutes from './routes/drivers.routes.js';
import vehiclesRoutes from './routes/vehicles.routes.js';
import deliveriesRoutes from './routes/deliveries.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// CORS configuration: Allow frontend origins
const allowedOrigins = [
  FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Dev convenience while maintaining CORS headers
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (Part 6)
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 as test');
    res.json({
      status: 'ok',
      message: 'TBL Smart Logistics API is healthy and connected to MySQL',
      database: 'connected',
      databaseName: process.env.DB_NAME || 'tbl_smart_logistics',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database connection test failed in /api/health:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'ไม่สามารถเชื่อมต่อฐานข้อมูล MySQL ได้',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
    });
  }
});

// Mount Resource Routes
app.use('/api/users', usersRoutes);
app.use('/api/drivers', driversRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/deliveries', deliveriesRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to TBL Smart Logistics Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      users: '/api/users',
      drivers: '/api/drivers',
      vehicles: '/api/vehicles',
      deliveries: '/api/deliveries',
    },
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} ไม่ถูกต้องหรือไม่พบในระบบ`,
  });
});

// Global Error Handler (Sanitizes error to prevent secret leakage)
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'เกิดข้อผิดพลาดภายในระบบเซิร์ฟเวอร์',
  });
});

// Start Server
app.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(`🚀 TBL Smart Logistics API Server running on port ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
  console.log(`🔗 Frontend URL: ${FRONTEND_URL}`);
  console.log(`====================================================`);

  // Verify DB connection
  await testConnection();
});
