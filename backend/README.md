# Backend - Excel Parser Service

Robust Excel parser for processing `.xls` files with ISO-8859-1 encoding.

## Installation

```bash
npm install
```

## Dependencies

- `xlsx` - Excel file parsing library
- `iconv-lite` - Character encoding conversion
- `jest` - Testing framework (dev dependency)

## Project Structure

```
backend/
├── services/
│   └── excelParser.js      # Main parser service
├── validators/
│   └── excelValidator.js   # Column schema and mappings
├── tests/
│   └── excelParser.test.js # Unit tests
├── IMPORT.md               # Detailed documentation
└── README.md               # This file
```

## Quick Start

```javascript
const { importData } = require('./services/excelParser');

// Import an Excel file
const result = await importData('./path/to/file.xls');

if (result.success) {
  console.log(`Imported ${result.totalRecords} documents`);
  // Process result.data for database insertion
} else {
  console.error('Import failed:', result.error);
}
```

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Features

- ✅ Reads .xls files with ISO-8859-1 encoding
- ✅ Handles corrupted characters (e.g., "Emiss鉶" → "Emissão")
- ✅ Converts EAN from scientific notation (5.60525E+12 → "5605250000000")
- ✅ Normalizes dates to ISO 8601 format (MM/DD/YYYY → YYYY-MM-DD)
- ✅ Validates structure and data
- ✅ Groups items by document number
- ✅ Handles duplicate column names
- ✅ Comprehensive error reporting

## Documentation

See [IMPORT.md](./IMPORT.md) for:
- Expected file format
- Column mappings
- Data transformations
- Common errors and solutions
- API reference

## API

### Main Functions

#### `importData(filePath)`
Main orchestration function that:
1. Parses the Excel file
2. Validates structure
3. Normalizes data
4. Validates each record
5. Groups items by document

#### `parseExcelFile(filePath)`
Reads and extracts data from Excel file.

#### `validateStructure(headers)`
Validates that all required columns are present.

#### `normalizeData(rawData)`
Applies transformations to normalize data types.

#### `validateData(data)`
Validates a single data record.

#### `groupItemsByDocument(data)`
Groups items by document number.

### Helper Functions

#### `fixEncoding(text)`
Fixes corrupted characters from ISO-8859-1 encoding.

#### `normalizeEAN(value)`
Converts EAN from scientific notation to string.

#### `normalizeDate(dateStr)`
Normalizes dates to YYYY-MM-DD format.

#### `normalizeNumber(value)`
Converts strings to numbers.

#### `normalizeString(value)`
Trims and normalizes string values.

## Example Output

```javascript
{
  success: true,
  totalRecords: 10,
  totalItems: 45,
  data: {
    "520-2025001258": {
      document_number: "520-2025001258",
      client_code: "ACL IMPE",
      emission_date: "2025-11-25",
      requested_date: "2026-01-16",
      items: [
        { item_number: 1, ean: "5605250000000", requested_quantity: 15 },
        { item_number: 2, ean: "5605250000001", requested_quantity: 15 }
      ],
      total_quantity: 30
    }
  },
  errors: []
}
```

## License

MIT
