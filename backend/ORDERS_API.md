# Orders API Documentation

## Base URL
```
/api/orders
```

## Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <token>
```

---

## Endpoints

### GET /api/orders

List orders with pagination, sorting, search and filters.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | Integer | 1 | Page number (min: 1) |
| `limit` | Integer | 25 | Records per page (min: 10, max: 100) |
| `sortBy` | String | `emission_date` | Column to sort by |
| `sortOrder` | String | `DESC` | Sort direction: `ASC` or `DESC` |
| `search` | String | - | Search in `document_number` or `po_number` (partial match, case-insensitive) |
| `status` | String | - | Filter by status |
| `client` | String | - | Filter by `client_code` or `client_name` (partial match) |
| `familyFilter` | String | - | Filter by `product_family` (partial match) |

#### Allowed Sort Columns

- `emission_date`
- `requested_date`
- `document_number`
- `client_code`
- `client_name`
- `po_number`
- `article_code`
- `product_family`
- `total_quantity`
- `status`
- `last_updated`

#### Allowed Status Values

- `in_production` - Order in production
- `completed` - Order completed
- `delayed` - Order delayed (past requested date)
- `invoiced` - Order invoiced
- `at_risk` - Order at risk (due within 3 days)

#### Response 200 OK

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "document_number": "520-2025001258",
      "client_code": "ACL IMPE",
      "client_name": "ACL IMPE LUTHIER",
      "emission_date": "2025-11-25",
      "requested_date": "2026-01-16",
      "po_number": "P03661.1",
      "article_code": "F161900120000005",
      "product_family": "Tapetes",
      "total_quantity": 30,
      "invoiced_quantity": 0,
      "open_quantity": 30,
      "status": "in_production",
      "last_updated": "2025-11-25T10:30:00Z",
      "statusDetails": {
        "status": "in_production",
        "color": "yellow",
        "label": "Em Produção",
        "daysUntilDue": 18
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "totalRecords": 1250,
    "totalPages": 50
  },
  "filters": {
    "appliedFilters": {
      "status": "in_production",
      "client": "ACL IMPE"
    }
  }
}
```

#### Response 400 Bad Request

```json
{
  "success": false,
  "error": "Invalid sortBy column",
  "allowedColumns": [
    "emission_date",
    "requested_date",
    "document_number",
    ...
  ]
}
```

#### Response 401 Unauthorized

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

#### Response 500 Internal Server Error

```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### GET /api/orders/:id

Get a single order by ID.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Order unique identifier |

#### Response 200 OK

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "document_number": "520-2025001258",
    "client_code": "ACL IMPE",
    "client_name": "ACL IMPE LUTHIER",
    "emission_date": "2025-11-25",
    "requested_date": "2026-01-16",
    "po_number": "P03661.1",
    "article_code": "F161900120000005",
    "product_family": "Tapetes",
    "total_quantity": 30,
    "invoiced_quantity": 0,
    "open_quantity": 30,
    "status": "in_production",
    "last_updated": "2025-11-25T10:30:00Z",
    "statusDetails": {
      "status": "in_production",
      "color": "yellow",
      "label": "Em Produção",
      "daysUntilDue": 18
    }
  }
}
```

#### Response 404 Not Found

```json
{
  "success": false,
  "error": "Order not found"
}
```

---

## cURL Examples

### List all orders (default pagination)
```bash
curl -X GET "https://api.example.com/api/orders" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

### Pagination
```bash
curl -X GET "https://api.example.com/api/orders?page=2&limit=50" \
  -H "Authorization: Bearer <token>"
```

### Sort by client code ascending
```bash
curl -X GET "https://api.example.com/api/orders?sortBy=client_code&sortOrder=ASC" \
  -H "Authorization: Bearer <token>"
```

### Search by document number
```bash
curl -X GET "https://api.example.com/api/orders?search=520-2025" \
  -H "Authorization: Bearer <token>"
```

### Filter by status
```bash
curl -X GET "https://api.example.com/api/orders?status=in_production" \
  -H "Authorization: Bearer <token>"
```

### Filter by client
```bash
curl -X GET "https://api.example.com/api/orders?client=ACL%20IMPE" \
  -H "Authorization: Bearer <token>"
```

### Combine multiple filters
```bash
curl -X GET "https://api.example.com/api/orders?status=in_production&client=ACL&page=1&limit=25&sortBy=emission_date&sortOrder=DESC" \
  -H "Authorization: Bearer <token>"
```

### Filter by product family
```bash
curl -X GET "https://api.example.com/api/orders?familyFilter=Tapetes" \
  -H "Authorization: Bearer <token>"
```

### Get single order
```bash
curl -X GET "https://api.example.com/api/orders/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer <token>"
```

---

## Status Details Calculation

The `statusDetails` object is calculated dynamically based on:

| Condition | Status | Color | Label |
|-----------|--------|-------|-------|
| `invoiced_quantity >= total_quantity` OR `open_quantity === 0` | `completed` | green | Concluída |
| `status === 'invoiced'` | `invoiced` | blue | Faturada |
| `daysUntilDue < 0` | `delayed` | red | Atrasada |
| `daysUntilDue < 3` | `at_risk` | orange | Em Risco |
| Default | `in_production` | yellow | Em Produção |

### Days Until Due Calculation
```
daysUntilDue = floor((requested_date - today) / (1000 * 60 * 60 * 24))
```

---

## Error Handling

### Validation Errors (400)
- Invalid `sortBy` column
- Invalid `sortOrder` value (must be ASC or DESC)
- Invalid `status` value
- Invalid pagination parameters

### Authentication Errors (401)
- Missing or invalid Bearer token

### Not Found Errors (404)
- Order ID does not exist

### Server Errors (500)
- Database connection issues
- Unexpected server errors

---

## Performance Optimizations

The following database indexes are implemented for optimal query performance:

### Single Column Indexes
- `idx_orders_client_code` - For client code exact matches
- `idx_orders_client_code_lower` - For case-insensitive client searches
- `idx_orders_status` - For status filtering
- `idx_orders_document_number` - For document number searches
- `idx_orders_po_number` - For PO number searches
- `idx_orders_product_family` - For product family filtering
- `idx_orders_emission_date` - For date-based sorting

### Composite Indexes
- `idx_orders_status_client` - For combined status + client filtering
- `idx_orders_sort_emission` - For efficient pagination with emission_date sorting
- `idx_orders_sort_client` - For efficient pagination with client sorting

### Search Optimization
- Full-text search index on `document_number` and `po_number`
- ILIKE queries for case-insensitive partial matching
- Parameterized queries to prevent SQL injection
