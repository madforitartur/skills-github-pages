const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, authorize, requireAdmin } = require('../middleware/authMiddleware');

// Rotas públicas (não requerem autenticação)
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);

// Rotas protegidas (requerem autenticação JWT)
router.get('/me', authenticate, authController.getCurrentUser);
router.post('/logout', authenticate, authController.logout);

// Rota para criar admin (apenas para setup inicial)
router.post('/create-admin', requireAdmin, authController.register);

module.exports = router;