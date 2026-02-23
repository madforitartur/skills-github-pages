# Orders API Backend

Backend API for managing orders with PostgreSQL database, featuring optimized pagination, sorting, search, and filtering.

## Features

- ✅ Pagination with configurable limits (10-100 records)
- ✅ Multi-column sorting with SQL injection protection
- ✅ Case-insensitive search in document numbers and PO numbers
- ✅ Filters by status, client, and product family
- ✅ Dynamic status calculation based on dates and quantities
- ✅ Database indexes for optimal performance
- ✅ Input validation and sanitization
- ✅ Bearer token authentication
- ✅ Comprehensive test coverage

## Tech Stack

- **Framework**: Express.js
- **Database**: PostgreSQL
- **Testing**: Jest + Supertest
- **Security**: Helmet, CORS

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Run Database Migrations

```bash
# Connect to PostgreSQL and run the migration
psql -U postgres -d orders_db -f database/migrations/001_create_orders_table.sql
```

### 4. Start Server

```bash
# Development
npm run dev

# Production
npm start
```

### 5. Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test -- --coverage
```

## API Endpoints

### GET /api/orders

List orders with pagination, sorting, and filters.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Records per page (default: 25, max: 100)
- `sortBy` - Column to sort by (default: emission_date)
- `sortOrder` - ASC or DESC (default: DESC)
- `search` - Search in document_number or po_number
- `status` - Filter by status
- `client` - Filter by client code or name
- `familyFilter` - Filter by product family

**Example:**
```bash
curl -X GET "http://localhost:3000/api/orders?page=1&limit=25&status=in_production" \
  -H "Authorization: Bearer your_token"
```

### GET /api/orders/:id

Get a single order by ID.

**Example:**
```bash
curl -X GET "http://localhost:3000/api/orders/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer your_token"
```

See [ORDERS_API.md](./ORDERS_API.md) for complete documentation.

## Database Indexes

The following indexes are created for optimal performance:

### Single Column Indexes
- `idx_orders_client_code` - Client code filtering
- `idx_orders_status` - Status filtering
- `idx_orders_document_number` - Document search
- `idx_orders_emission_date` - Date sorting

### Composite Indexes
- `idx_orders_status_client` - Combined status + client queries
- `idx_orders_sort_emission` - Efficient pagination with date sorting

## Project Structure

```
backend/
├── config/
│   └── database.js          # PostgreSQL connection pool
├── controllers/
│   └── ordersController.js  # Order API endpoints
├── database/
│   └── migrations/
│       └── 001_create_orders_table.sql
├── services/
│   └── orderStatusService.js # Status calculation logic
├── tests/
│   └── orders.test.js       # API tests
├── .env.example             # Environment variables template
├── jest.config.js           # Test configuration
├── ORDERS_API.md            # API documentation
├── package.json             # Dependencies
├── README.md                # This file
└── server.js                # Express server entry point
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | development |
| `PORT` | Server port | 3000 |
| `DB_HOST` | PostgreSQL host | localhost |
| `DB_PORT` | PostgreSQL port | 5432 |
| `DB_NAME` | Database name | orders_db |
| `DB_USER` | Database user | postgres |
| `DB_PASSWORD` | Database password | - |
| `ALLOWED_ORIGINS` | CORS allowed origins | http://localhost:3000 |

## Status Calculation Logic

Orders are automatically assigned a status based on:

1. **Completed** (green): `invoiced_quantity >= total_quantity` OR `open_quantity === 0`
2. **Invoiced** (blue): `status === 'invoiced'`
3. **Delayed** (red): Past requested date (`daysUntilDue < 0`)
4. **At Risk** (orange): Due within 3 days (`daysUntilDue < 3`)
5. **In Production** (yellow): Default state

## Security Features

- SQL injection protection via parameterized queries
- Sort column validation against whitelist
- Input trimming and sanitization
- CORS configuration
- Helmet security headers
- Bearer token authentication middleware

## License

MIT
