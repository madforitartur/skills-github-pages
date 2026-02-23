-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_number VARCHAR(50) NOT NULL,
    client_code VARCHAR(50) NOT NULL,
    client_name VARCHAR(200) NOT NULL,
    emission_date DATE NOT NULL,
    requested_date DATE NOT NULL,
    po_number VARCHAR(100),
    article_code VARCHAR(50) NOT NULL,
    product_family VARCHAR(100),
    total_quantity INTEGER NOT NULL DEFAULT 0,
    invoiced_quantity INTEGER NOT NULL DEFAULT 0,
    open_quantity INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'in_production',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimization
-- Index for client searches (exact match and partial)
CREATE INDEX IF NOT EXISTS idx_orders_client_code ON orders(client_code);
CREATE INDEX IF NOT EXISTS idx_orders_client_code_lower ON orders(LOWER(client_code));

-- Index for client name searches
CREATE INDEX IF NOT EXISTS idx_orders_client_name ON orders(client_name);
CREATE INDEX IF NOT EXISTS idx_orders_client_name_lower ON orders(LOWER(client_name));

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Index for document number searches
CREATE INDEX IF NOT EXISTS idx_orders_document_number ON orders(document_number);

-- Index for PO number searches
CREATE INDEX IF NOT EXISTS idx_orders_po_number ON orders(po_number);

-- Index for product family filtering
CREATE INDEX IF NOT EXISTS idx_orders_product_family ON orders(product_family);
CREATE INDEX IF NOT EXISTS idx_orders_product_family_lower ON orders(LOWER(product_family));

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_orders_status_client ON orders(status, client_code);
CREATE INDEX IF NOT EXISTS idx_orders_emission_date ON orders(emission_date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_requested_date ON orders(requested_date);

-- Index for full-text search on document_number and po_number
CREATE INDEX IF NOT EXISTS idx_orders_document_search ON orders USING gin(to_tsvector('simple', document_number || ' ' || COALESCE(po_number, '')));

-- Index for pagination and sorting
CREATE INDEX IF NOT EXISTS idx_orders_sort_emission ON orders(emission_date DESC, id);
CREATE INDEX IF NOT EXISTS idx_orders_sort_client ON orders(client_code ASC, id);

-- Comments for documentation
COMMENT ON TABLE orders IS 'Production orders table with optimized indexes for filtering and pagination';
COMMENT ON COLUMN orders.document_number IS 'Unique document number for the order';
COMMENT ON COLUMN orders.client_code IS 'Client code for filtering (indexed)';
COMMENT ON COLUMN orders.status IS 'Order status: in_production, completed, delayed, invoiced, at_risk';
COMMENT ON COLUMN orders.emission_date IS 'Order emission date for sorting';
