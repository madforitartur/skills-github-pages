CREATE TABLE IF NOT EXISTS production_progress (
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

CREATE INDEX IF NOT EXISTS idx_production_progress_order ON production_progress(order_id);
CREATE INDEX IF NOT EXISTS idx_production_progress_sector ON production_progress(sector_id);
CREATE INDEX IF NOT EXISTS idx_production_progress_status ON production_progress(status);
