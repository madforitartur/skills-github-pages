CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS production_progress CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS saved_reports CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS import_logs CASCADE;
DROP TABLE IF EXISTS production_sectors CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) NOT NULL DEFAULT 'viewer',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE import_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  file_name VARCHAR(255) NOT NULL,
  total_records INT,
  success_count INT,
  error_count INT,
  import_mode VARCHAR(50),
  status VARCHAR(50),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_number VARCHAR(50) NOT NULL UNIQUE,
  client_code VARCHAR(100) NOT NULL,
  client_name VARCHAR(255),
  emission_date DATE NOT NULL,
  requested_date DATE NOT NULL,
  po_number VARCHAR(100),
  article_code VARCHAR(100),
  product_family VARCHAR(100),
  ean_code VARCHAR(50),
  total_quantity INT NOT NULL DEFAULT 0,
  invoiced_quantity INT DEFAULT 0,
  open_quantity INT DEFAULT 0,
  status VARCHAR(50),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_open_qty CHECK (open_quantity >= 0),
  CONSTRAINT check_invoiced_qty CHECK (invoiced_quantity >= 0)
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_number INT NOT NULL,
  color_code VARCHAR(50),
  color_description VARCHAR(255),
  size_code VARCHAR(50),
  size_description VARCHAR(255),
  quantity INT NOT NULL,
  ean_code VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(order_id, item_number)
);

CREATE TABLE production_sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  display_order INT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE production_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sector_id UUID NOT NULL REFERENCES production_sectors(id),
  quantity INT DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status VARCHAR(50),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(order_id, sector_id),
  CONSTRAINT check_progress_qty CHECK (quantity >= 0)
);

CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  alert_type VARCHAR(100),
  severity VARCHAR(50),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  theme VARCHAR(50) DEFAULT 'light',
  items_per_page INT DEFAULT 25,
  saved_filters JSONB DEFAULT '[]'::jsonb,
  visible_columns JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE saved_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  report_type VARCHAR(100),
  filters JSONB,
  columns JSONB,
  groupby VARCHAR(100),
  is_template BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_document_number ON orders(document_number);
CREATE INDEX IF NOT EXISTS idx_orders_client_code ON orders(client_code);
CREATE INDEX IF NOT EXISTS idx_orders_po_number ON orders(po_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_requested_date ON orders(requested_date);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

CREATE INDEX IF NOT EXISTS idx_production_progress_order ON production_progress(order_id);
CREATE INDEX IF NOT EXISTS idx_production_progress_sector ON production_progress(sector_id);
CREATE INDEX IF NOT EXISTS idx_production_progress_status ON production_progress(status);

CREATE INDEX IF NOT EXISTS idx_alerts_order_id ON alerts(order_id);
CREATE INDEX IF NOT EXISTS idx_alerts_alert_type ON alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_saved_reports_user_id ON saved_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_reports_is_template ON saved_reports(is_template);

INSERT INTO production_sectors (name, display_order, description) VALUES
('Tecelagem', 1, 'Primeiro sector de produção - Tecelagem'),
('Felpo Cru', 2, 'Processamento de Felpo Cru'),
('Tinturaria', 3, 'Tinturaria e coloração'),
('Confeccao', 4, 'Confecção de Roupões e Felpos'),
('Embalagem', 5, 'Embalagem e Acabamento'),
('Armazem', 6, 'Stock e Armazém de Expedição')
ON CONFLICT (name) DO NOTHING;
