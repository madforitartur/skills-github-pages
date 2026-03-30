const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_EXPIRES_IN = '7d';

/**
 * Gera um token JWT
 * @param {string} userId - ID do utilizador
 * @param {string} email - Email do utilizador
 * @param {string} role - Role do utilizador
 * @param {Object} options - Opções adicionais
 * @returns {string} - Token JWT
 */
function generateToken(userId, email, role, options = {}) {
  try {
    if (!userId || !email || !role) {
      throw new Error('userId, email e role são obrigatórios');
    }

    const payload = {
      id: userId,
      email,
      role,
      iat: Math.floor(Date.now() / 1000)
    };

    // Adiciona opções customizadas
    const tokenOptions = {
      expiresIn: options.expiresIn || JWT_EXPIRES_IN,
      ...options
    };

    const token = jwt.sign(payload, JWT_SECRET, tokenOptions);
    
    return token;
  } catch (error) {
    throw new Error(`Erro ao gerar token: ${error.message}`);
  }
}

/**
 * Gera um token de refresh
 * @param {string} userId - ID do utilizador
 * @param {string} email - Email do utilizador
 * @param {string} role - Role do utilizador
 * @returns {string} - Token de refresh
 */
function generateRefreshToken(userId, email, role) {
  try {
    return generateToken(userId, email, role, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      subject: 'refresh'
    });
  } catch (error) {
    throw new Error(`Erro ao gerar token de refresh: ${error.message}`);
  }
}

/**
 * Verifica e decodifica um token JWT
 * @param {string} token - Token JWT
 * @param {Object} options - Opções de verificação
 * @returns {Object} - Payload decodificado
 */
function verifyToken(token, options = {}) {
  try {
    if (!token || typeof token !== 'string') {
      throw new Error('Token deve ser uma string não vazia');
    }

    // Remove "Bearer " do início se presente
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;

    const decoded = jwt.verify(cleanToken, JWT_SECRET, options);
    
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expirado');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Token inválido');
    } else {
      throw new Error(`Erro ao verificar token: ${error.message}`);
    }
  }
}

/**
 * Decodifica um token sem verificar (usado para debug)
 * @param {string} token - Token JWT
 * @returns {Object} - Payload decodificado
 */
function decodeToken(token) {
  try {
    if (!token) {
      throw new Error('Token deve ser fornecido');
    }

    const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    const decoded = jwt.decode(cleanToken);
    
    return decoded;
  } catch (error) {
    throw new Error(`Erro ao decodificar token: ${error.message}`);
  }
}

/**
 * Verifica se um token está próximo do vencimento
 * @param {string} token - Token JWT
 * @param {number} thresholdMinutes - Minutos de antecedência para considerar próximo do vencimento
 * @returns {boolean} - True se está próximo do vencimento
 */
function isTokenExpiringSoon(token, thresholdMinutes = 30) {
  try {
    const decoded = decodeToken(token);
    
    if (!decoded || !decoded.exp) {
      return true; // Considera como expirando se não conseguir decodificar
    }

    const now = Math.floor(Date.now() / 1000);
    const timeToExpiry = decoded.exp - now;
    const thresholdSeconds = thresholdMinutes * 60;

    return timeToExpiry <= thresholdSeconds;
  } catch (error) {
    return true; // Em caso de erro, considera como expirando
  }
}

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  decodeToken,
  isTokenExpiringSoon,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN
};