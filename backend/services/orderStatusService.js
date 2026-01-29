/**
 * Calculate status details for an order based on dates and quantities
 * @param {Object} order - Order object from database
 * @returns {Object} Status details with color, label, and days until due
 */
function calculateStatusDetails(order) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const requestedDate = new Date(order.requested_date);
  requestedDate.setHours(0, 0, 0, 0);
  
  const daysUntilDue = Math.floor((requestedDate - today) / (1000 * 60 * 60 * 24));
  
  let status = order.status;
  let color = 'gray';
  let label = 'Desconhecido';
  
  if (order.invoiced_quantity >= order.total_quantity || order.open_quantity === 0) {
    status = 'completed';
    color = 'green';
    label = 'Concluída';
  } else if (order.status === 'invoiced') {
    status = 'invoiced';
    color = 'blue';
    label = 'Faturada';
  } else if (daysUntilDue < 0) {
    status = 'delayed';
    color = 'red';
    label = 'Atrasada';
  } else if (daysUntilDue < 3) {
    status = 'at_risk';
    color = 'orange';
    label = 'Em Risco';
  } else {
    status = 'in_production';
    color = 'yellow';
    label = 'Em Produção';
  }
  
  return {
    status,
    color,
    label,
    daysUntilDue
  };
}

/**
 * Validate sort column to prevent SQL injection
 * @param {string} column - Column name to validate
 * @param {string[]} allowedColumns - List of allowed column names
 * @returns {boolean} True if column is valid
 */
function validateSortColumn(column, allowedColumns) {
  if (!column || typeof column !== 'string') {
    return false;
  }
  
  // Only allow alphanumeric characters and underscores
  const validColumnPattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
  
  if (!validColumnPattern.test(column)) {
    return false;
  }
  
  return allowedColumns.includes(column);
}

/**
 * Get list of allowed sort columns for orders
 * @returns {string[]} Array of allowed column names
 */
function getAllowedSortColumns() {
  return [
    'emission_date',
    'requested_date',
    'document_number',
    'client_code',
    'total_quantity',
    'status',
    'client_name',
    'po_number',
    'article_code',
    'product_family',
    'last_updated'
  ];
}

module.exports = {
  calculateStatusDetails,
  validateSortColumn,
  getAllowedSortColumns
};
