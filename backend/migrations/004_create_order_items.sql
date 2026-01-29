CREATE TABLE IF NOT EXISTS order_items (
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

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
