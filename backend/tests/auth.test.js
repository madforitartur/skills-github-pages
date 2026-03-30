const request = require('supertest');
const app = require('../server');
const { initializeTestData } = require('../services/userService');

describe('Autenticação JWT - Endpoints de Auth', () => {
  
  beforeEach(() => {
    // Limpar dados de teste antes de cada teste
    initializeTestData();
  });

  describe('POST /api/auth/register', () => {
    
    const validUser = {
      email: 'teste@example.com',
      password: 'password123',
      firstName: 'João',
      lastName: 'Silva'
    };

    test('Deve registar utilizador com sucesso', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUser)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
      
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(validUser.email);
      expect(response.body.user.firstName).toBe(validUser.firstName);
      expect(response.body.user.lastName).toBe(validUser.lastName);
      expect(response.body.user.role).toBe('viewer');
      
      // Password não deve estar na resposta
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user).not.toHaveProperty('passwordHash');
    });

    test('Deve rejeitar registo com email duplicado', async () => {
      // Primeiro registo
      await request(app)
        .post('/api/auth/register')
        .send(validUser)
        .expect(201);

      // Segundo registo com mesmo email
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUser)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Email já está em uso');
    });

    test('Deve rejeitar registo sem campos obrigatórios', async () => {
      const invalidUser = {
        email: 'test@example.com'
        // Falta password, firstName, lastName
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Todos os campos são obrigatórios');
    });

    test('Deve rejeitar registo com email inválido', async () => {
      const invalidUser = {
        ...validUser,
        email: 'email-invalido'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Email deve ter um formato válido');
    });

    test('Deve rejeitar registo com password muito curta', async () => {
      const invalidUser = {
        ...validUser,
        password: '123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Password deve ter pelo menos 6 caracteres');
    });
  });

  describe('POST /api/auth/login', () => {
    
    const testUser = {
      email: 'login@example.com',
      password: 'password123',
      firstName: 'Maria',
      lastName: 'Santos'
    };

    beforeEach(async () => {
      // Registar utilizador para testes de login
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });

    test('Deve fazer login com credenciais corretas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.firstName).toBe(testUser.firstName);
      expect(response.body.user.role).toBe('viewer');
    });

    test('Deve rejeitar login com email inexistente', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'inexistente@example.com',
          password: 'password123'
        })
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Utilizador não encontrado');
    });

    test('Deve rejeitar login com password incorreta', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'password-errada'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Email ou password incorretos');
    });

    test('Deve rejeitar login sem campos obrigatórios', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email
          // Falta password
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Email e password são obrigatórios');
    });
  });

  describe('GET /api/auth/me', () => {
    
    let authToken;
    let testUser;

    beforeEach(async () => {
      // Registar e fazer login para obter token
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'me@example.com',
          password: 'password123',
          firstName: 'Pedro',
          lastName: 'Oliveira'
        });

      authToken = registerResponse.body.token;
      testUser = registerResponse.body.user;
    });

    test('Deve obter dados do utilizador autenticado', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.id).toBe(testUser.id);
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.firstName).toBe(testUser.firstName);
      expect(response.body.user.lastName).toBe(testUser.lastName);
      expect(response.body.user.role).toBe(testUser.role);
    });

    test('Deve rejeitar pedido sem token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Token de autorização é obrigatório');
    });

    test('Deve rejeitar pedido com token inválido', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer token-invalido')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Token inválido');
    });

    test('Deve rejeitar pedido com token mal formatado', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Formato de token inválido');
    });
  });

  describe('POST /api/auth/logout', () => {
    
    let authToken;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'logout@example.com',
          password: 'password123',
          firstName: 'Ana',
          lastName: 'Costa'
        });

      authToken = response.body.token;
    });

    test('Deve fazer logout com sucesso', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Logout realizado com sucesso');
    });

    test('Deve fazer logout mesmo sem refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .send({}) // Sem refresh token
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/refresh', () => {
    
    let refreshToken;
    let authToken;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'refresh@example.com',
          password: 'password123',
          firstName: 'Carlos',
          lastName: 'Ribeiro'
        });

      authToken = response.body.token;
      refreshToken = response.body.refreshToken;
    });

    test('Deve renovar token com refresh token válido', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: refreshToken
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      
      // Novo token deve ser diferente do anterior
      expect(response.body.token).not.toBe(authToken);
    });

    test('Deve rejeitar refresh token inválido', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'token-invalido'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Token de refresh inválido ou expirado');
    });

    test('Deve rejeitar sem refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Refresh token é obrigatório');
    });
  });

  describe('Health Check', () => {
    
    test('GET /health deve retornar status OK', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Endpoint Inexistente', () => {
    
    test('Deve retornar 404 para endpoint inexistente', async () => {
      const response = await request(app)
        .get('/api/auth/endpoint-inexistente')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Endpoint não encontrado');
    });
  });
});