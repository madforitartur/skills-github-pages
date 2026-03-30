const { verifyToken, decodeToken } = require('../services/jwtService');

/**
 * Middleware de autenticação JWT
 * Valida o token JWT do header Authorization e adiciona req.user
 */
function authenticate(req, res, next) {
  try {
    // Obter token do header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'Token de autorização é obrigatório'
      });
    }

    // Verificar se começa com "Bearer "
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Formato de token inválido. Use: Bearer <token>'
      });
    }

    // Extrair token
    const token = authHeader.substring(7); // Remove "Bearer " (7 caracteres)

    if (!token) {
      return res.status(401).json({
        error: 'Token não fornecido'
      });
    }

    // Verificar e decodificar token
    const decoded = verifyToken(token);

    // Adicionar dados do utilizador ao request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    // Adicionar token para potencial logout posterior
    req.token = token;

    next();

  } catch (error) {
    if (error.message.includes('Token expirado')) {
      return res.status(401).json({
        error: 'Token expirado. Faça login novamente'
      });
    }

    if (error.message.includes('Token inválido')) {
      return res.status(401).json({
        error: 'Token inválido'
      });
    }

    console.error('Erro na autenticação:', error);
    res.status(401).json({
      error: 'Token de autorização inválido'
    });
  }
}

/**
 * Middleware de autorização por roles
 * @param {Array<string>} allowedRoles - Array de roles permitidos
 * @returns {Function} - Middleware function
 */
function authorize(allowedRoles = []) {
  return (req, res, next) => {
    try {
      // Verificar se o utilizador está autenticado
      if (!req.user) {
        return res.status(401).json({
          error: 'Utilizador não autenticado'
        });
      }

      // Verificar se o role do utilizador está nos roles permitidos
      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          error: 'Acesso negado. Permissões insuficientes',
          required: allowedRoles,
          current: req.user.role
        });
      }

      next();

    } catch (error) {
      console.error('Erro na autorização:', error);
      res.status(403).json({
        error: 'Erro ao verificar permissões'
      });
    }
  };
}

/**
 * Middleware opcional de autenticação
 * Tenta autenticar o utilizador mas não falha se não conseguir
 */
function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      if (token) {
        const decoded = verifyToken(token);
        req.user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role
        };
        req.token = token;
      }
    }

    next();

  } catch (error) {
    // Em caso de erro na autenticação opcional, continua sem autenticado
    console.log('Autenticação opcional falhou:', error.message);
    next();
  }
}

/**
 * Middleware para verificar se o utilizador é admin
 */
function requireAdmin(req, res, next) {
  return authorize(['admin'])(req, res, next);
}

/**
 * Middleware para verificar se o utilizador é admin ou manager
 */
function requireAdminOrManager(req, res, next) {
  return authorize(['admin', 'manager'])(req, res, next);
}

/**
 * Middleware para verificar se o utilizador é o mesmo que está a fazer a ação
 * ou tem role de admin
 */
function requireSelfOrAdmin(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Utilizador não autenticado'
      });
    }

    // Se for admin, permite tudo
    if (req.user.role === 'admin') {
      return next();
    }

    // Se for o próprio utilizador, permite
    if (req.user.id === req.params.userId || req.user.id === req.params.id) {
      return next();
    }

    // Caso contrário, nega
    return res.status(403).json({
      error: 'Acesso negado. Pode apenas aceder aos seus próprios dados'
    });

  } catch (error) {
    console.error('Erro na verificação self/admin:', error);
    res.status(403).json({
      error: 'Erro ao verificar permissões'
    });
  }
}

/**
 * Função utilitária para extrair informações do token sem verificar
 * (útil para debug e logging)
 */
function extractTokenInfo(req) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = decodeToken(token);
    
    return {
      userId: decoded?.id,
      email: decoded?.email,
      role: decoded?.role,
      expiresAt: decoded?.exp ? new Date(decoded.exp * 1000) : null
    };

  } catch (error) {
    console.error('Erro ao extrair info do token:', error);
    return null;
  }
}

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  requireAdmin,
  requireAdminOrManager,
  requireSelfOrAdmin,
  extractTokenInfo
};