# Base de Dados - Sistema de Gestão de Encomendas

## Diagrama ER (texto)

```
users (1) ────< import_logs
users (1) ────< saved_reports
users (1) ────1 user_preferences

orders (1) ────< order_items
orders (1) ────< production_progress >──── (1) production_sectors
orders (1) ────< alerts
```

## Descrição das Tabelas

### users
Armazena utilizadores do sistema, credenciais e roles.

### import_logs
Histórico de importações de ficheiros Excel, incluindo status e erros.

### orders
Dados principais das encomendas, incluindo quantidades e estado de produção.

### order_items
Linhas individuais de artigos associados a uma encomenda.

### production_sectors
Lista de sectores de produção e respetiva ordem de apresentação.

### production_progress
Progresso de produção por encomenda e sector.

### alerts
Alertas de risco, atraso e anomalias por encomenda.

### user_preferences
Preferências personalizadas de cada utilizador.

### saved_reports
Relatórios guardados e templates configurados pelo utilizador.

## Relacionamentos

- `import_logs.user_id` → `users.id`
- `order_items.order_id` → `orders.id`
- `production_progress.order_id` → `orders.id`
- `production_progress.sector_id` → `production_sectors.id`
- `alerts.order_id` → `orders.id`
- `user_preferences.user_id` → `users.id`
- `saved_reports.user_id` → `users.id`

## Como executar

### Inicialização do schema

```bash
psql -U postgres -d encomendas_db -f backend/database/init.sql
```

### Seed de dados iniciais

```bash
psql -U postgres -d encomendas_db -f backend/database/seed.sql
```

### Backup

```bash
DB_NAME=encomendas_db DB_USER=postgres BACKUP_DIR=./backups backend/database/backup.sh
```

## Notas de dados de teste

- O utilizador admin padrão tem email `admin@encomendas.local`.
- Substitua o `password_hash` no `seed.sql` por um hash real antes de produção.
- Adicione novos dados de teste ao final do `seed.sql` conforme necessário.
