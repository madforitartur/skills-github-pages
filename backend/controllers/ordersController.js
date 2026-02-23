const { pool } = require('../config/database');
const { calculateStatusDetails, validateSortColumn, getAllowedSortColumns } = require('../services/orderStatusService');

/**
 * GET /api/orders
 * List orders with pagination, sorting, search and filters
 */
async function getOrders(req, res) {
  try {
    // 1. Validar e extrair query parameters
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(10, parseInt(req.query.limit) || 25));
    const sortBy = req.query.sortBy || 'emission_date';
    const sortOrder = (req.query.sortOrder || 'DESC').toUpperCase();
    const search = req.query.search?.trim();
    const status = req.query.status;
    const client = req.query.client?.trim();
    const familyFilter = req.query.familyFilter?.trim();

    // 2. Validar sortOrder (apenas ASC ou DESC permitido)
    if (!['ASC', 'DESC'].includes(sortOrder)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid sortOrder. Use ASC or DESC'
      });
    }

    // 3. Validar sortBy (evitar SQL injection)
    const allowedSortColumns = getAllowedSortColumns();
    if (!validateSortColumn(sortBy, allowedSortColumns)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid sortBy column',
        allowedColumns: allowedSortColumns
      });
    }

    // 4. Validar status se fornecido
    const allowedStatuses = ['in_production', 'completed', 'delayed', 'invoiced', 'at_risk'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status',
        allowedStatuses
      });
    }

    // 5. Construir query SQL base
    let whereConditions = ['1=1'];
    const params = [];
    let paramCount = 1;

    // Aplicar filtros
    if (search) {
      whereConditions.push(`(document_number ILIKE $${paramCount} OR po_number ILIKE $${paramCount})`);
      params.push(`%${search}%`);
      paramCount++;
    }

    if (status) {
      whereConditions.push(`status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    if (client) {
      whereConditions.push(`(client_code ILIKE $${paramCount} OR client_name ILIKE $${paramCount})`);
      params.push(`%${client}%`);
      paramCount++;
    }

    if (familyFilter) {
      whereConditions.push(`product_family ILIKE $${paramCount}`);
      params.push(`%${familyFilter}%`);
      paramCount++;
    }

    const whereClause = whereConditions.join(' AND ');

    // 6. Contar total de registos (antes de paginação)
    const countQuery = `SELECT COUNT(*) FROM orders WHERE ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const totalRecords = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalRecords / limit);

    // 7. Construir query principal com ordenação e paginação
    const query = `
      SELECT 
        id,
        document_number,
        client_code,
        client_name,
        emission_date,
        requested_date,
        po_number,
        article_code,
        product_family,
        total_quantity,
        invoiced_quantity,
        open_quantity,
        status,
        last_updated
      FROM orders 
      WHERE ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const paginationParams = [...params, limit, (page - 1) * limit];

    // 8. Executar query
    const result = await pool.query(query, paginationParams);

    // 9. Adicionar detalhes de status a cada encomenda
    const orders = result.rows.map(order => ({
      id: order.id,
      document_number: order.document_number,
      client_code: order.client_code,
      client_name: order.client_name,
      emission_date: order.emission_date,
      requested_date: order.requested_date,
      po_number: order.po_number,
      article_code: order.article_code,
      product_family: order.product_family,
      total_quantity: order.total_quantity,
      invoiced_quantity: order.invoiced_quantity,
      open_quantity: order.open_quantity,
      status: order.status,
      last_updated: order.last_updated,
      statusDetails: calculateStatusDetails(order)
    }));

    // 10. Construir objeto de filtros aplicados
    const appliedFilters = {};
    if (search) appliedFilters.search = search;
    if (status) appliedFilters.status = status;
    if (client) appliedFilters.client = client;
    if (familyFilter) appliedFilters.familyFilter = familyFilter;

    // 11. Retornar resultado
    return res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages
      },
      filters: {
        appliedFilters
      }
    });

  } catch (error) {
    console.error('Error in getOrders:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * GET /api/orders/:id
 * Get a single order by ID
 */
async function getOrderById(req, res) {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        id,
        document_number,
        client_code,
        client_name,
        emission_date,
        requested_date,
        po_number,
        article_code,
        product_family,
        total_quantity,
        invoiced_quantity,
        open_quantity,
        status,
        last_updated
      FROM orders 
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const order = result.rows[0];
    const orderWithStatus = {
      ...order,
      statusDetails: calculateStatusDetails(order)
    };

    return res.status(200).json({
      success: true,
      data: orderWithStatus
    });

  } catch (error) {
    console.error('Error in getOrderById:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = {
  getOrders,
  getOrderById
};
