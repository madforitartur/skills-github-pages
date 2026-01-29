require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração de CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware global
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logs de requests (desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'API de Autenticação JWT',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        me: 'GET /api/auth/me',
        refresh: 'POST /api/auth/refresh'
      },
      health: 'GET /health'
    },
    documentation: '/api/auth/docs'
  });
});

// Middleware de tratamento de erros 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    method: req.method,
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Middleware global de tratamento de erros
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  
  // Erro de validação do Express
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'JSON inválido no corpo da requisição'
    });
  }

  // Erro de payload muito grande
  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Payload da requisição é muito grande'
    });
  }

  // Erro padrão do servidor
  res.status(500).json({
    error: 'Erro interno do servidor',
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Iniciar servidor
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Servidor a executar na porta ${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`API docs: http://localhost:${PORT}/`);
  });
}

module.exports = app;