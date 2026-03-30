# Sistema de Autenticação JWT

Este documento explica como funciona o sistema de autenticação JWT implementado na API do sistema de encomendas.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Endpoints](#endpoints)
- [Fluxo de Autenticação](#fluxo-de-autenticação)
- [Uso no Frontend](#uso-no-frontend)
- [Segurança](#segurança)
- [Tratamento de Erros](#tratamento-de-erros)
- [Desenvolvimento](#desenvolvimento)

## 🎯 Visão Geral

O sistema implementa autenticação baseada em JSON Web Tokens (JWT) com as seguintes funcionalidades:

- **Registro de utilizadores** com hash de passwords
- **Login/Logout** com geração de tokens
- **Autorização baseada em roles** (admin, viewer, etc.)
- **Tokens de refresh** para renovação automática
- **Validação automática** via middleware

### 🏗️ Arquitetura

```
Backend/
├── controllers/     # Controladores de rotas
├── services/         # Lógica de negócio
├── middleware/       # Middleware de autenticação
├── routes/          # Definição de rotas
└── server.js        # Servidor principal
```

## 🚀 Instalação

### 1. Instalar Dependências

```bash
cd backend
npm install
```

### 2. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar com suas configurações
nano .env
```

### 3. Criar Utilizador Admin

```bash
# Executar script de criação do admin
npm run seed
```

## ⚙️ Configuração

### Variáveis de Ambiente (.env)

```env
# Servidor
PORT=3000
NODE_ENV=development

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:3000

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=24h

# Password Hashing
BCRYPT_ROUNDS=10
```

### Roles do Sistema

- **admin**: Acesso total ao sistema
- **viewer**: Acesso limitado (padrão para novos utilizadores)

## 🔗 Endpoints

### Autenticação

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| `POST` | `/api/auth/register` | Registrar novo utilizador | ❌ Não |
| `POST` | `/api/auth/login` | Fazer login | ❌ Não |
| `POST` | `/api/auth/logout` | Fazer logout | ✅ Sim |
| `GET` | `/api/auth/me` | Obter dados do utilizador | ✅ Sim |
| `POST` | `/api/auth/refresh` | Renovar token | ❌ Não |

### Sistema

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/health` | Health check |

### Exemplos de Uso

#### 1. Registro de Utilizador

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "João",
    "lastName": "Silva"
  }'
```

**Resposta (201):**
```json
{
  "message": "Utilizador registado com sucesso",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "João",
    "lastName": "Silva",
    "role": "viewer"
  },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Resposta (200):**
```json
{
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "João",
    "role": "viewer"
  }
}
```

#### 3. Obter Dados do Utilizador

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Resposta (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "João",
    "lastName": "Silva",
    "role": "viewer"
  }
}
```

## 🔄 Fluxo de Autenticação

### 1. Registro/Login
```
1. Cliente envia credenciais
2. Backend valida e cria utilizador (registro)
3. Backend verifica credenciais (login)
4. Backend gera JWT + Refresh Token
5. Backend retorna tokens ao cliente
```

### 2. Acesso a Recursos Protegidos
```
1. Cliente inclui token no header: Authorization: Bearer <token>
2. Middleware de autenticação valida token
3. Se válido: adiciona req.user e continua
4. Se inválido: retorna 401 Unauthorized
```

### 3. Renovação de Token
```
1. Quando token está próximo do vencimento
2. Cliente envia refresh token
3. Backend valida refresh token
4. Backend gera novo access token
5. Retorna novo token ao cliente
```

## 💻 Uso no Frontend

### JavaScript/React

```javascript
// API Service
class AuthAPI {
  static baseURL = 'http://localhost:3000/api/auth';

  static async register(userData) {
    const response = await fetch(`${this.baseURL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    
    return response.json();
  }

  static async login(credentials) {
    const response = await fetch(`${this.baseURL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials)
    });
    
    return response.json();
  }

  static async getCurrentUser(token) {
    const response = await fetch(`${this.baseURL}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.json();
  }
}

// Context para autenticação
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const login = async (credentials) => {
    const response = await AuthAPI.login(credentials);
    
    if (response.token) {
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    
    return response;
  };

  const logout = async () => {
    await fetch(`${AuthAPI.baseURL}/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para proteger rotas
export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}

// Componente protegido
function ProtectedRoute({ children }) {
  const { token } = useAuth();
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  return children;
}
```

### Axios Interceptors

```javascript
import axios from 'axios';

// Configurar interceptor para incluir token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para renovação automática de token
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('/api/auth/refresh', {
          refreshToken
        });
        
        const newToken = response.data.token;
        localStorage.setItem('token', newToken);
        
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh falhou, redirecionar para login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

## 🔒 Segurança

### Medidas Implementadas

- ✅ **Hash de passwords** com bcrypt (salt rounds configuráveis)
- ✅ **JWT com expiração** (24h por padrão)
- ✅ **Tokens de refresh** para renovação segura
- ✅ **Validação de entrada** em todos os endpoints
- ✅ **CORS configurado** para domínios específicos
- ✅ **Headers de segurança** implementados
- ✅ **Logs de auditoria** em desenvolvimento

### Boas Práticas

```javascript
// ❌ Não faça isto (password em texto limpo)
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123' // ❌ Nunca armazenar assim
  })
});

// ✅ Faça isto (usar HTTPS + tokens JWT)
const token = 'eyJhbGciOiJIUzI1NiIs...'; // ✅ Token criptografado
fetch('/api/protected', {
  headers: {
    'Authorization': `Bearer ${token}` // ✅ Header seguro
  }
});
```

### Configurações de Produção

```env
# ⚠️ OBRIGATÓRIO em produção
NODE_ENV=production
JWT_SECRET=super_secret_jwt_key_minimo_32_caracteres_super_seguro_2024

# ⚠️ Considere usar tokens mais curtos em produção
JWT_EXPIRES_IN=1h

# ⚠️ Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## ⚠️ Tratamento de Erros

### Códigos de Status

| Código | Significado | Quando Usar |
|--------|-------------|-------------|
| `200` | Sucesso | Operações bem-sucedidas |
| `201` | Criado | Registro de utilizador |
| `400` | Bad Request | Dados inválidos ou em falta |
| `401` | Unauthorized | Token inválido/expirado |
| `403` | Forbidden | Role insuficiente |
| `404` | Not Found | Utilizador não existe |
| `500` | Internal Error | Erro do servidor |

### Exemplos de Respostas de Erro

#### Token Expirado (401)
```json
{
  "error": "Token expirado. Faça login novamente"
}
```

#### Dados Inválidos (400)
```json
{
  "error": "Todos os campos são obrigatórios: email, password, firstName, lastName"
}
```

#### Email Duplicado (400)
```json
{
  "error": "Email já está em uso"
}
```

## 🛠️ Desenvolvimento

### Scripts Disponíveis

```bash
# Executar servidor em desenvolvimento
npm run dev

# Executar testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com coverage
npm run test:coverage

# Criar utilizador admin
npm run seed
```

### Estrutura de Middleware

```javascript
// Uso básico de autenticação
router.get('/protected', authenticate, (req, res) => {
  res.json({ message: `Olá ${req.user.email}!` });
});

// Autorização por role
router.get('/admin-only', authenticate, authorize(['admin']), (req, res) => {
  res.json({ message: 'Área restrita para admins' });
});

// Múltiplos roles
router.get('/management', authenticate, authorize(['admin', 'manager']), (req, res) => {
  res.json({ message: 'Área de gestão' });
});

// Middleware customizado
router.get('/self', authenticate, requireSelfOrAdmin, (req, res) => {
  res.json({ userId: req.params.id });
});
```

### Debug e Logging

```javascript
// Verificar informações do token (debug)
const { extractTokenInfo } = require('./middleware/authMiddleware');

// Em uma rota
router.get('/debug', authenticate, (req, res) => {
  const tokenInfo = extractTokenInfo(req);
  console.log('Token Info:', tokenInfo);
  res.json(tokenInfo);
});
```

## 📚 Recursos Adicionais

- [JWT.io](https://jwt.io/) - Debugger e informações sobre JWT
- [bcryptjs](https://www.npmjs.com/package/bcryptjs) - Hash de passwords
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) - Implementação JWT
- [OWASP Authentication](https://owasp.org/www-project-cheat-sheets/cheatsheets/Authentication_Cheat_Sheet.html) - Guia de segurança

## 🤝 Suporte

Para questões sobre o sistema de autenticação:

1. Verificar este documento
2. Consultar os testes em `tests/auth.test.js`
3. Verificar logs do servidor
4. Validar configurações de ambiente

---

**⚠️ Nota de Segurança**: Em produção, sempre use HTTPS, tokens seguros e mantenha o `JWT_SECRET` em ambiente protegido.