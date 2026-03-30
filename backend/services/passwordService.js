const bcrypt = require('bcryptjs');
require('dotenv').config();

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 10;

/**
 * Gera hash da password usando bcrypt
 * @param {string} password - Password em texto limpo
 * @returns {Promise<string>} - Hash da password
 */
async function hashPassword(password) {
  try {
    if (!password || typeof password !== 'string') {
      throw new Error('Password deve ser uma string não vazia');
    }

    if (password.length < 6) {
      throw new Error('Password deve ter pelo menos 6 caracteres');
    }

    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);
    
    return hash;
  } catch (error) {
    throw new Error(`Erro ao gerar hash da password: ${error.message}`);
  }
}

/**
 * Verifica se a password corresponde ao hash
 * @param {string} password - Password em texto limpo
 * @param {string} hash - Hash da password
 * @returns {Promise<boolean>} - True se as passwords coincidem
 */
async function verifyPassword(password, hash) {
  try {
    if (!password || !hash) {
      throw new Error('Password e hash são obrigatórios');
    }

    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  } catch (error) {
    throw new Error(`Erro ao verificar password: ${error.message}`);
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
  BCRYPT_ROUNDS
};