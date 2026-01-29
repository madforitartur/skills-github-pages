const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const db = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const ordersRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Encomendas API - Backend running successfully',
    version: '1.0.0',
    endpoints: {
      orders: '/api/orders',
    },
  });
});

app.get('/health', async (req, res) => {
  const dbStatus = await db.testConnection();
  res.status(dbStatus ? 200 : 503).json({
    success: dbStatus,
    message: dbStatus ? 'Server is healthy' : 'Database connection failed',
    database: dbStatus ? 'connected' : 'disconnected',
  });
});

app.use('/api/orders', ordersRoutes);

app.use(errorHandler);

const startServer = async () => {
  try {
    await db.testConnection();
    
    app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 API Base URL: http://localhost:${PORT}`);
      console.log(`📊 Health Check: http://localhost:${PORT}/health`);
      console.log('='.repeat(50));
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
