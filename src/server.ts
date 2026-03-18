import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import sequelize, { testConnection } from './config/database';
// import { initializeDatabase } from './services/database-init.service';

// Load environment variables
config();

// Create Express application
const app: Application = express();
const PORT = process.env.PORT || 3000;

// MIDDLEWARE SETUP

// Enable CORS
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
  })
);

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// ROUTES
// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'HR Management API is running',
    timestamp: new Date().toISOString(),
  });
});

// API base route
app.get('/api', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to HR Management API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      employees: '/api/employees (coming soon)',
      departments: '/api/departments (coming soon)',
      attendance: '/api/attendance (coming soon)',
      leaves: '/api/leaves (coming soon)',
      payroll: '/api/payroll (coming soon)',
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

// START SERVER
const startServer = async () => {
  try {
    try {
      await testConnection();
      await sequelize.sync();
      console.log('Database synced successfully');
    } catch (dbError) {
      console.warn('Database unavailable. Starting API without database sync.', dbError);
    }

    // await initializeDatabase();

    // Start listening
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`API_BASE_URL: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
