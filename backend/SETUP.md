# Setup Guide - Backend API

Este documento fornece instruções detalhadas para configurar o ambiente de desenvolvimento do backend.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm** (vem com Node.js)
- **PostgreSQL 14+** - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)

## 🔧 Instalação Passo a Passo

### 1. Clonar o Repositório

```bash
git clone <url-do-repositorio>
cd backend
```

### 2. Instalar Dependências

```bash
npm install
```

Isso instalará todas as dependências listadas no `package.json`.

### 3. Configurar PostgreSQL

#### No Linux/Mac:

```bash
# Instalar PostgreSQL (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Iniciar o serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Acessar o PostgreSQL
sudo -u postgres psql
```

#### No Windows:

1. Baixe e instale o PostgreSQL do site oficial
2. Durante a instalação, configure uma senha para o usuário `postgres`
3. O serviço PostgreSQL será iniciado automaticamente

#### Criar o Banco de Dados:

```sql
-- No prompt do psql
CREATE DATABASE encomendas_db;

-- Criar usuário (opcional, se quiser usar outro usuário)
CREATE USER seu_usuario WITH PASSWORD 'sua_senha';

-- Conceder privilégios
GRANT ALL PRIVILEGES ON DATABASE encomendas_db TO seu_usuario;

-- Sair do psql
\q
```

### 4. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e edite com suas configurações:

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
NODE_ENV=development
PORT=5000

# Configure com suas credenciais do PostgreSQL
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=encomendas_db
DATABASE_USER=postgres
DATABASE_PASSWORD=sua_senha_aqui

# Gere uma chave secreta forte (ex: usando openssl)
JWT_SECRET=cole_aqui_uma_string_aleatoria_longa
```

**Dica:** Para gerar um JWT_SECRET seguro:

```bash
# Linux/Mac
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 5. Testar a Conexão

```bash
npm run dev
```

Se tudo estiver configurado corretamente, você verá:

```
✅ Database connected successfully
==================================================
🚀 Server running on port 5000
📍 Environment: development
🌐 API Base URL: http://localhost:5000
📊 Health Check: http://localhost:5000/health
==================================================
```

### 6. Verificar Endpoints

Abra outro terminal e teste:

```bash
# Health check
curl http://localhost:5000/health

# Informações da API
curl http://localhost:5000/

# Endpoint de orders (placeholder)
curl http://localhost:5000/api/orders
```

## 🐛 Troubleshooting

### Erro: "connect ECONNREFUSED 127.0.0.1:5432"

**Problema:** PostgreSQL não está rodando ou não está acessível.

**Solução:**
```bash
# Linux/Mac
sudo systemctl status postgresql
sudo systemctl start postgresql

# Windows
# Verifique o serviço "postgresql-x64-14" no Gerenciador de Serviços
```

### Erro: "password authentication failed"

**Problema:** Senha do PostgreSQL incorreta.

**Solução:**
1. Verifique a senha no arquivo `.env`
2. Tente resetar a senha do PostgreSQL:

```bash
sudo -u postgres psql
ALTER USER postgres PASSWORD 'nova_senha';
\q
```

### Erro: "database encomendas_db does not exist"

**Problema:** O banco de dados não foi criado.

**Solução:**
```bash
sudo -u postgres psql
CREATE DATABASE encomendas_db;
\q
```

### Porta 5000 já está em uso

**Problema:** Outra aplicação está usando a porta 5000.

**Solução:**
- Mude a porta no arquivo `.env`: `PORT=3000`
- Ou finalize o processo que está usando a porta:

```bash
# Linux/Mac
lsof -ti:5000 | xargs kill -9

# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process
```

## 🔄 Comandos Úteis

```bash
# Desenvolvimento (auto-restart)
npm run dev

# Produção
npm start

# Verificar versão do Node
node --version

# Verificar versão do npm
npm --version

# Limpar cache do npm
npm cache clean --force

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

## 📦 Dependências Instaladas

### Produção:
- **express** - Framework web
- **dotenv** - Gerenciamento de variáveis de ambiente
- **cors** - Middleware CORS
- **morgan** - Logger HTTP
- **pg** - Cliente PostgreSQL
- **uuid** - Geração de UUIDs

### Desenvolvimento:
- **nodemon** - Auto-restart do servidor

## 🔒 Segurança

⚠️ **IMPORTANTE:**
- Nunca commite o arquivo `.env` para o Git
- Use senhas fortes para o PostgreSQL
- Troque o `JWT_SECRET` em produção
- Não exponha credenciais em logs

## 📚 Próximos Passos

Após completar o setup:

1. ✅ Setup inicial completo
2. ⏳ Criar schema de banco de dados (próxima tarefa)
3. ⏳ Implementar autenticação JWT
4. ⏳ Implementar CRUD de encomendas
5. ⏳ Adicionar validações
6. ⏳ Testes automatizados

## 🆘 Precisa de Ajuda?

Se encontrar problemas não listados aqui:

1. Verifique os logs do servidor
2. Verifique os logs do PostgreSQL: `/var/log/postgresql/` (Linux)
3. Consulte a documentação oficial das tecnologias

---

**Status do Setup:** ✅ Pronto para desenvolvimento
