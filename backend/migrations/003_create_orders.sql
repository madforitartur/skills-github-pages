CREATE TABLE IF NOT EXISTS orders (
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

CREATE INDEX IF NOT EXISTS idx_orders_document_number ON orders(document_number);
CREATE INDEX IF NOT EXISTS idx_orders_client_code ON orders(client_code);
CREATE INDEX IF NOT EXISTS idx_orders_po_number ON orders(po_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_requested_date ON orders(requested_date);
