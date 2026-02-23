const request = require('supertest');
const express = require('express');
const { getOrders, getOrderById } = require('../controllers/ordersController');

// Mock the database and service modules
jest.mock('../config/database', () => ({
  pool: {
    query: jest.fn()
  }
}));

jest.mock('../services/orderStatusService', () => ({
  calculateStatusDetails: jest.fn((order) => ({
    status: order.status,
    color: 'green',
    label: 'Test Status',
    daysUntilDue: 5
  })),
  validateSortColumn: jest.fn((column, allowed) => allowed.includes(column)),
  getAllowedSortColumns: jest.fn(() => [
    'emission_date', 'requested_date', 'document_number',
    'client_code', 'total_quantity', 'status', 'client_name',
    'po_number', 'article_code', 'product_family', 'last_updated'
  ])
}));

const { pool } = require('../config/database');
const { calculateStatusDetails } = require('../services/orderStatusService');

describe('Orders API', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.get('/api/orders', getOrders);
    app.get('/api/orders/:id', getOrderById);
    jest.clearAllMocks();
  });

  describe('GET /api/orders', () => {
    const mockOrder = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      document_number: '520-2025001258',
      client_code: 'ACL IMPE',
      client_name: 'ACL IMPE LUTHIER',
      emission_date: '2025-11-25',
      requested_date: '2026-01-16',
      po_number: 'P03661.1',
      article_code: 'F161900120000005',
      product_family: 'Tapetes',
      total_quantity: 30,
      invoiced_quantity: 0,
      open_quantity: 30,
      status: 'in_production',
      last_updated: '2025-11-25T10:30:00Z'
    };

    test('should return orders without filters', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ count: '100' }] })
        .mockResolvedValueOnce({ rows: [mockOrder] });

      const response = await request(app)
        .get('/api/orders')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination).toEqual({
        page: 1,
        limit: 25,
        totalRecords: 100,
        totalPages: 4
      });
      expect(calculateStatusDetails).toHaveBeenCalled();
    });

    test('should handle pagination correctly', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ count: '1250' }] })
        .mockResolvedValueOnce({ rows: [mockOrder, mockOrder] });

      const response = await request(app)
        .get('/api/orders?page=2&limit=50')
        .expect(200);

      expect(response.body.pagination).toEqual({
        page: 2,
        limit: 50,
        totalRecords: 1250,
        totalPages: 25
      });
    });

    test('should enforce maximum limit of 100', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ count: '200' }] })
        .mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/orders?limit=200')
        .expect(200);

      expect(response.body.pagination.limit).toBe(100);
    });

    test('should enforce minimum limit of 10', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ count: '200' }] })
        .mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/orders?limit=5')
        .expect(200);

      expect(response.body.pagination.limit).toBe(10);
    });

    test('should handle sorting by emission_date DESC', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ count: '50' }] })
        .mockResolvedValueOnce({ rows: [mockOrder] });

      const response = await request(app)
        .get('/api/orders?sortBy=emission_date&sortOrder=DESC')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY emission_date DESC'),
        expect.any(Array)
      );
    });

    test('should handle sorting by client_code ASC', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ count: '50' }] })
        .mockResolvedValueOnce({ rows: [mockOrder] });

      const response = await request(app)
        .get('/api/orders?sortBy=client_code&sortOrder=ASC')
        .expect(200);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY client_code ASC'),
        expect.any(Array)
      );
    });

    test('should return 400 for invalid sortBy column', async () => {
      const response = await request(app)
        .get('/api/orders?sortBy=invalid_column')
        .expect(400);

      expect(response.body.error).toBe('Invalid sortBy column');
      expect(response.body.allowedColumns).toBeDefined();
    });

    test('should return 400 for invalid sortOrder', async () => {
      const response = await request(app)
        .get('/api/orders?sortOrder=INVALID')
        .expect(400);

      expect(response.body.error).toBe('Invalid sortOrder. Use ASC or DESC');
    });

    test('should filter by status', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ count: '10' }] })
        .mockResolvedValueOnce({ rows: [mockOrder] });

      const response = await request(app)
        .get('/api/orders?status=in_production')
        .expect(200);

      expect(response.body.filters.appliedFilters).toEqual({ status: 'in_production' });
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('status = $'),
        expect.any(Array)
      );
    });

    test('should return 400 for invalid status', async () => {
      const response = await request(app)
        .get('/api/orders?status=invalid_status')
        .expect(400);

      expect(response.body.error).toBe('Invalid status');
    });

    test('should filter by client', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ count: '5' }] })
        .mockResolvedValueOnce({ rows: [mockOrder] });

      const response = await request(app)
        .get('/api/orders?client=ACL IMPE')
        .expect(200);

      expect(response.body.filters.appliedFilters).toEqual({ client: 'ACL IMPE' });
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('client_code ILIKE'),
        expect.any(Array)
      );
    });

    test('should search by document_number or po_number', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ count: '3' }] })
        .mockResolvedValueOnce({ rows: [mockOrder] });

      const response = await request(app)
        .get('/api/orders?search=520-2025')
        .expect(200);

      expect(response.body.filters.appliedFilters).toEqual({ search: '520-2025' });
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('document_number ILIKE'),
        expect.any(Array)
      );
    });

    test('should filter by product family', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ count: '8' }] })
        .mockResolvedValueOnce({ rows: [mockOrder] });

      const response = await request(app)
        .get('/api/orders?familyFilter=Tapetes')
        .expect(200);

      expect(response.body.filters.appliedFilters).toEqual({ familyFilter: 'Tapetes' });
    });

    test('should combine multiple filters correctly', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ count: '2' }] })
        .mockResolvedValueOnce({ rows: [mockOrder] });

      const response = await request(app)
        .get('/api/orders?status=in_production&client=ACL&search=520&page=1&limit=10')
        .expect(200);

      expect(response.body.filters.appliedFilters).toEqual({
        status: 'in_production',
        client: 'ACL',
        search: '520'
      });
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });

    test('should handle empty results', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ count: '0' }] })
        .mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/orders?client=NONEXISTENT')
        .expect(200);

      expect(response.body.data).toHaveLength(0);
      expect(response.body.pagination.totalRecords).toBe(0);
      expect(response.body.pagination.totalPages).toBe(0);
    });

    test('should trim search and client parameters', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ count: '1' }] })
        .mockResolvedValueOnce({ rows: [mockOrder] });

      await request(app)
        .get('/api/orders?search=%20%20520%20%20&client=%20%20ACL%20%20')
        .expect(200);

      const countCallParams = pool.query.mock.calls[0][1];
      expect(countCallParams[0]).toBe('%520%');
      expect(countCallParams[1]).toBe('%ACL%');
    });

    test('should handle database errors gracefully', async () => {
      pool.query.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/api/orders')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Internal server error');
    });
  });

  describe('GET /api/orders/:id', () => {
    const mockOrder = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      document_number: '520-2025001258',
      client_code: 'ACL IMPE',
      client_name: 'ACL IMPE LUTHIER',
      emission_date: '2025-11-25',
      requested_date: '2026-01-16',
      po_number: 'P03661.1',
      article_code: 'F161900120000005',
      product_family: 'Tapetes',
      total_quantity: 30,
      invoiced_quantity: 0,
      open_quantity: 30,
      status: 'in_production',
      last_updated: '2025-11-25T10:30:00Z'
    };

    test('should return order by id', async () => {
      pool.query.mockResolvedValueOnce({ rows: [mockOrder] });

      const response = await request(app)
        .get('/api/orders/550e8400-e29b-41d4-a716-446655440000')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(mockOrder.id);
      expect(response.body.data.statusDetails).toBeDefined();
    });

    test('should return 404 for non-existent order', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/orders/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Order not found');
    });

    test('should handle database errors', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/orders/123')
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });
});
