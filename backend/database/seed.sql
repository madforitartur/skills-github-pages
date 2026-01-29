CREATE EXTENSION IF NOT EXISTS "pgcrypto";

INSERT INTO users (email, password_hash, first_name, last_name, role, active)
VALUES ('admin@encomendas.local', 'admin', 'Admin', 'User', 'admin', true)
ON CONFLICT (email) DO NOTHING;

INSERT INTO production_sectors (name, display_order, description) VALUES
('Tecelagem', 1, 'Primeiro sector de produção - Tecelagem'),
('Felpo Cru', 2, 'Processamento de Felpo Cru'),
('Tinturaria', 3, 'Tinturaria e coloração'),
('Confeccao', 4, 'Confecção de Roupões e Felpos'),
('Embalagem', 5, 'Embalagem e Acabamento'),
('Armazem', 6, 'Stock e Armazém de Expedição')
ON CONFLICT (name) DO NOTHING;
