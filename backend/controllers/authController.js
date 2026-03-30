const { 
  registerUser, 
  loginUser, 
  logoutUser, 
  refreshUserToken, 
  getCurrentUser: getCurrentUserService 
} = require('../services/userService');

/**
 * Registar novo utilizador
 */
async function register(req, res) {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validações
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        error: 'Todos os campos são obrigatórios: email, password, firstName, lastName'
      });
    }

    if (!email.includes('@')) {
      return res.status(400).json({
        error: 'Email deve ter um formato válido'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password deve ter pelo menos 6 caracteres'
      });
    }

    // Registrar utilizador
    const result = await registerUser({
      email: email.trim(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim()
    });

    res.status(201).json({
      message: 'Utilizador registado com sucesso',
      user: result.user,
      token: result.token,
      refreshToken: result.refreshToken
    });

  } catch (error) {
    if (error.message.includes('Email já existe')) {
      return res.status(400).json({
        error: 'Email já está em uso'
      });
    }

    console.error('Erro ao registar utilizador:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
}

/**
 * Login do utilizador
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validações
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email e password são obrigatórios'
      });
    }

    // Fazer login
    const result = await loginUser({
      email: email.trim(),
      password
    });

    res.status(200).json({
      message: 'Login realizado com sucesso',
      token: result.token,
      refreshToken: result.refreshToken,
      user: result.user
    });

  } catch (error) {
    if (error.message.includes('Utilizador não encontrado')) {
      return res.status(404).json({
        error: 'Utilizador não encontrado'
      });
    }

    if (error.message.includes('Email ou password incorretos')) {
      return res.status(401).json({
        error: 'Email ou password incorretos'
      });
    }

    console.error('Erro ao fazer login:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
}

/**
 * Logout do utilizador
 */
async function logout(req, res) {
  try {
    const refreshToken = req.body.refreshToken || req.query.refreshToken;

    logoutUser(refreshToken);

    res.status(200).json({
      message: 'Logout realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
}

/**
 * Obter dados do utilizador atual
 */
async function getCurrentUser(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Utilizador não autenticado'
      });
    }

    const user = getCurrentUserService(req.user.id);

    res.status(200).json({
      user
    });

  } catch (error) {
    if (error.message.includes('Utilizador não encontrado')) {
      return res.status(404).json({
        error: 'Utilizador não encontrado'
      });
    }

    console.error('Erro ao obter utilizador:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
}

/**
 * Renovar token de acesso
 */
async function refreshToken(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token é obrigatório'
      });
    }

    const result = refreshUserToken(refreshToken);

    res.status(200).json({
      message: 'Token renovado com sucesso',
      token: result.token,
      user: result.user
    });

  } catch (error) {
    if (error.message.includes('Token de refresh inválido')) {
      return res.status(401).json({
        error: 'Token de refresh inválido ou expirado'
      });
    }

    console.error('Erro ao renovar token:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
}

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  refreshToken
};