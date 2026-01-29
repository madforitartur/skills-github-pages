const { v4: uuidv4 } = require('uuid');
const { hashPassword, verifyPassword } = require('./passwordService');
const { generateToken, generateRefreshToken } = require('./jwtService');

// Simulação de base de dados em memória
const users = new Map();
const refreshTokens = new Set();

/**
 * Modelo de dados para utilizador
 */
class User {
  constructor({ id, email, firstName, lastName, role, passwordHash, createdAt, updatedAt }) {
    this.id = id || uuidv4();
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.role = role || 'viewer';
    this.passwordHash = passwordHash;
    this.createdAt = createdAt || new Date().toISOString();
    this.updatedAt = updatedAt || new Date().toISOString();
  }

  // Remove a password hash das respostas públicas
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Verifica a password
  async verifyPassword(password) {
    return await verifyPassword(password, this.passwordHash);
  }
}

/**
 * Registar novo utilizador
 */
async function registerUser({ email, password, firstName, lastName }) {
  try {
    // Verificar se email já existe
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      throw new Error('Email já existe');
    }

    // Hash da password
    const passwordHash = await hashPassword(password);

    // Criar novo utilizador
    const user = new User({
      email: email.toLowerCase(),
      firstName,
      lastName,
      passwordHash,
      role: 'viewer' // Role padrão
    });

    // Guardar na "base de dados"
    users.set(user.id, user);

    // Gerar tokens
    const token = generateToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id, user.email, user.role);
    refreshTokens.add(refreshToken);

    return {
      user: user.toJSON(),
      token,
      refreshToken
    };
  } catch (error) {
    throw new Error(`Erro ao registar utilizador: ${error.message}`);
  }
}

/**
 * Login do utilizador
 */
async function loginUser({ email, password }) {
  try {
    const user = findUserByEmail(email);
    if (!user) {
      throw new Error('Utilizador não encontrado');
    }

    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
      throw new Error('Email ou password incorretos');
    }

    // Gerar tokens
    const token = generateToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id, user.email, user.role);
    refreshTokens.add(refreshToken);

    return {
      user: user.toJSON(),
      token,
      refreshToken
    };
  } catch (error) {
    throw new Error(`Erro ao fazer login: ${error.message}`);
  }
}

/**
 * Logout do utilizador
 */
function logoutUser(refreshToken) {
  try {
    if (refreshToken) {
      refreshTokens.delete(refreshToken);
    }
    return true;
  } catch (error) {
    throw new Error(`Erro ao fazer logout: ${error.message}`);
  }
}

/**
 * Renovar token de acesso
 */
function refreshUserToken(refreshToken) {
  try {
    if (!refreshToken || !refreshTokens.has(refreshToken)) {
      throw new Error('Token de refresh inválido');
    }

    // Verificar se o refresh token é válido
    const { verifyToken } = require('./jwtService');
    const decoded = verifyToken(refreshToken);

    // Encontrar utilizador
    const user = findUserById(decoded.id);
    if (!user) {
      throw new Error('Utilizador não encontrado');
    }

    // Gerar novo token de acesso
    const newToken = generateToken(user.id, user.email, user.role);

    return {
      token: newToken,
      user: user.toJSON()
    };
  } catch (error) {
    throw new Error(`Erro ao renovar token: ${error.message}`);
  }
}

/**
 * Obter utilizador atual
 */
function getCurrentUserById(userId) {
  try {
    const user = findUserById(userId);
    if (!user) {
      throw new Error('Utilizador não encontrado');
    }

    return user.toJSON();
  } catch (error) {
    throw new Error(`Erro ao obter utilizador: ${error.message}`);
  }
}

/**
 * Funções auxiliares para encontrar utilizadores
 */
function findUserByEmail(email) {
  if (!email) return null;
  
  for (const user of users.values()) {
    if (user.email === email.toLowerCase()) {
      return user;
    }
  }
  return null;
}

function findUserById(id) {
  return users.get(id);
}

/**
 * Criar utilizador admin
 */
async function createAdminUser({ email, password, firstName, lastName }) {
  try {
    // Verificar se já existe
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return existingUser;
    }

    // Hash da password
    const passwordHash = await hashPassword(password);

    // Criar utilizador admin
    const admin = new User({
      email: email.toLowerCase(),
      firstName,
      lastName,
      passwordHash,
      role: 'admin'
    });

    users.set(admin.id, admin);

    return admin;
  } catch (error) {
    throw new Error(`Erro ao criar utilizador admin: ${error.message}`);
  }
}

/**
 * Inicializar base de dados com dados de teste
 */
function initializeTestData() {
  // Esta função pode ser expandida para incluir dados de teste
  return {
    totalUsers: users.size,
    activeRefreshTokens: refreshTokens.size
  };
}

module.exports = {
  User,
  registerUser,
  loginUser,
  logoutUser,
  refreshUserToken,
  getCurrentUser: getCurrentUserById,
  createAdminUser,
  findUserByEmail,
  findUserById,
  initializeTestData,
  users,
  refreshTokens
};