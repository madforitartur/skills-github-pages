# Backend - Sistema de Gestão de Encomendas

API REST desenvolvida em Node.js + Express para gerenciar encomendas com autenticação JWT e integração com PostgreSQL.

## 🚀 Tecnologias Utilizadas

- **Node.js 18+** - Runtime JavaScript
- **Express.js** - Framework web minimalista
- **PostgreSQL** - Banco de dados relacional
- **dotenv** - Gerenciamento de variáveis de ambiente
- **cors** - Middleware para requisições cross-origin
- **morgan** - Logger HTTP
- **pg** - Cliente PostgreSQL para Node.js
- **uuid** - Geração de identificadores únicos
- **nodemon** - Auto-restart em desenvolvimento

## 📁 Estrutura de Pastas

```
backend/
├── config/
│   └── database.js          # Configuração de conexão PostgreSQL (Pool)
├── controllers/
│   └── ordersController.js  # Lógica de negócio para encomendas
├── models/
│   └── Order.js             # Model de encomenda
├── routes/
│   └── orders.js            # Rotas da API de encomendas
├── middleware/
│   └── errorHandler.js      # Middleware global de tratamento de erros
├── .env                     # Variáveis de ambiente (não versionado)
├── .env.example             # Template de variáveis de ambiente
├── .gitignore               # Arquivos ignorados pelo Git
├── server.js                # Arquivo principal de entrada
└── package.json             # Gerenciamento de dependências
```

## ⚙️ Configuração e Instalação

### 1. Clonar o Repositório

```bash
git clone <url-do-repositorio>
cd backend
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz da pasta `backend` baseado no `.env.example`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
NODE_ENV=development
PORT=5000

# PostgreSQL Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=encomendas_db
DATABASE_USER=postgres
DATABASE_PASSWORD=sua_senha_aqui

# JWT Authentication (será utilizado nas próximas etapas)
JWT_SECRET=seu_secret_jwt_super_seguro_aqui
```

### 4. Configurar PostgreSQL

Certifique-se de que o PostgreSQL está instalado e rodando. Em seguida, crie o banco de dados:

```bash
psql -U postgres
CREATE DATABASE encomendas_db;
\q
```

> **Nota:** O schema de tabelas será criado na próxima etapa do projeto.

## 🏃 Executar o Projeto

### Modo Desenvolvimento (com auto-restart)

```bash
npm run dev
```

### Modo Produção

```bash
npm start
```

O servidor estará disponível em: **http://localhost:5000**

## 🔍 Endpoints Disponíveis

### Health Check

```
GET /health
```

Verifica o status do servidor e da conexão com o banco de dados.

**Resposta de Sucesso:**
```json
{
  "success": true,
  "message": "Server is healthy",
  "database": "connected"
}
```

### Informações da API

```
GET /
```

Retorna informações sobre a API e endpoints disponíveis.

### Orders (Encomendas)

```
GET /api/orders
```

> **Nota:** Este endpoint retorna uma resposta placeholder. A implementação completa será feita nas próximas etapas.

## 🧪 Testando a API

### Com curl:

```bash
# Health check
curl http://localhost:5000/health

# Informações da API
curl http://localhost:5000/

# Lista de encomendas (placeholder)
curl http://localhost:5000/api/orders
```

### Com HTTPie:

```bash
http GET http://localhost:5000/health
http GET http://localhost:5000/api/orders
```

### Com Postman ou Insomnia:

Importe as rotas manualmente ou use os endpoints listados acima.

## 📝 Próximos Passos

1. **Criar Schema de Banco de Dados** - Definir tabelas, relacionamentos e migrations
2. **Implementar Autenticação JWT** - Sistema de login e proteção de rotas
3. **Implementar CRUD Completo de Encomendas** - Criar, ler, atualizar e deletar encomendas
4. **Adicionar Validações** - Validação de dados de entrada
5. **Testes Automatizados** - Testes unitários e de integração
6. **Documentação da API** - Swagger/OpenAPI

## 🛠️ Desenvolvimento

### Convenções de Código

- Usar `camelCase` para variáveis e funções
- Usar `PascalCase` para classes e componentes
- Usar `const` por padrão, `let` quando necessário
- Sempre usar async/await para operações assíncronas
- Tratamento de erros com try/catch e middleware global

### Scripts NPM

- `npm start` - Inicia o servidor em modo produção
- `npm run dev` - Inicia o servidor em modo desenvolvimento com nodemon
- `npm test` - Executa testes (a ser implementado)

## 📄 Licença

Este projeto está sob a licença MIT.

## 👥 Contribuições

Contribuições são bem-vindas! Por favor, abra uma issue ou pull request.

---

**Status:** ✅ Setup inicial completo - Pronto para desenvolvimento
