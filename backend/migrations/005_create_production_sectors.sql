CREATE TABLE IF NOT EXISTS production_sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  display_order INT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO production_sectors (name, display_order, description) VALUES
('Tecelagem', 1, 'Primeiro sector de produção - Tecelagem'),
('Felpo Cru', 2, 'Processamento de Felpo Cru'),
('Tinturaria', 3, 'Tinturaria e coloração'),
('Confeccao', 4, 'Confecção de Roupões e Felpos'),
('Embalagem', 5, 'Embalagem e Acabamento'),
('Armazem', 6, 'Stock e Armazém de Expedição')
ON CONFLICT (name) DO NOTHING;
