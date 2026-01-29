# Excel Import Documentation

## Overview

This Excel parser processes `.xls` files with ISO-8859-1 encoding, validates the structure, normalizes data, and groups items by document number for database import.

## File Format

- **File Type:** `.xls` (Excel 97-2003)
- **Encoding:** ISO-8859-1 (characters may appear corrupted in UTF-8 viewers)
- **Sheet:** First sheet is processed
- **Header Row:** First row contains column headers

## Expected Columns

The Excel file must contain the following columns:

| Column | Database Field | Type | Required |
|--------|---------------|------|----------|
| Nr.Documento | document_number | string | Yes |
| Terceiro | client_code | string | Yes |
| Data Emissão | emission_date | date (YYYY-MM-DD) | Yes |
| Data Pedida | requested_date | date (YYYY-MM-DD) | No |
| Item | item_number | integer | No |
| PO | po_number | string | No |
| Cod.Artigo | product_code | string | No |
| Referencia | reference | string | No |
| Cor | color_code | string | No |
| Descricao | cor_descricao | string | No |
| Tam | size_code | string | No |
| Familia | family | string | No |
| Descricao | tamanho_descricao | string | No |
| EAN | ean | string (13 digits) | No |
| Qtd Pedida | requested_quantity | number | No |
| Data Tec. | tech_date | date (YYYY-MM-DD) | No |
| Felpo Cru | felpo_cru | boolean | No |
| Data F.Cru | felpo_cru_date | date (YYYY-MM-DD) | No |
| Tinturaria | tinturaria | boolean | No |
| Data Tint. | tinturaria_date | date (YYYY-MM-DD) | No |
| Confeccao Roupoes | confeccao_roupoes | boolean | No |
| Confeccao Felpos | confeccao_felpos | boolean | No |
| Data Conf. | confeccao_date | date (YYYY-MM-DD) | No |
| Emb./Acab. | emb_acab | boolean | No |
| Data Arm. Exp. | arm_exp_date | date (YYYY-MM-DD) | No |
| Stock Cx. | stock_caixa | boolean | No |
| Data Ent. | ent_date | date (YYYY-MM-DD) | No |
| Data Especial. | especial_date | date (YYYY-MM-DD) | No |
| Data Printer. | printer_date | date (YYYY-MM-DD) | No |
| Data Debuxo. | debuxo_date | date (YYYY-MM-DD) | No |
| Data Amostras. | amostras_date | date (YYYY-MM-DD) | No |
| Data Bordados. | bordados_date | date (YYYY-MM-DD) | No |
| Facturada | facturada | boolean | No |
| Em Aberto | em_aberto | boolean | No |

## Data Transformations

### EAN Codes

**Problem:** Excel displays large EAN codes in scientific notation (e.g., `5.60525E+12`)

**Solution:** Automatically converted to full string representation

| Input | Output |
|-------|--------|
| 5.60525E+12 | "5605250000000" |
| 1.23E+10 | "12300000000" |
| 5605250000000 | "5605250000000" |

### Dates

**Problem:** Dates may be in MM/DD/YYYY format or Excel serial numbers

**Solution:** Normalized to ISO 8601 format (YYYY-MM-DD)

| Input | Output |
|-------|--------|
| 11/25/2025 | 2025-11-25 |
| 1/5/2026 | 2026-01-05 |
| 2025-11-25 | 2025-11-25 |
| Excel serial date | YYYY-MM-DD |

### Character Encoding

**Problem:** ISO-8859-1 characters appear corrupted in UTF-8

**Common Corruptions:**

| Corrupted | Correct |
|-----------|---------|
| Emiss鉶 | Emissão |
| 陌 | da |
| Descri莽茫o | Descrição |
| Confec莽茫o | Confecção |

**Solution:** Automatic character correction applied to all text fields

### Empty/Null Values

**Problem:** Empty cells may contain empty strings, spaces, or be missing

**Solution:** All empty values converted to `null`

| Input | Output |
|-------|--------|
| "" | null |
| " " | null |
| (empty cell) | null |

### Duplicate Columns

**Problem:** "Descricao" appears twice (for color and size descriptions)
**Problem:** "Familia" appears twice

**Solution:** Automatically remapped:
- First "Descricao" → `cor_descricao`
- Second "Descricao" → `tamanho_descricao`

## Data Validation

### Required Fields

- `document_number` - Must be present and non-empty
- `emission_date` - Must be present and valid date

### Business Rules

- `requested_quantity` - Must be greater than 0 if present
- All quantity fields - Must be >= 0 if present

## Usage Example

```javascript
const { importData } = require('./backend/services/excelParser');

const result = await importData('./data/orders.xls');

if (result.success) {
  console.log(`Imported ${result.totalRecords} documents`);
  console.log(`Total items: ${result.totalItems}`);
  
  // Access grouped data
  for (const [docNumber, doc] of Object.entries(result.data)) {
    console.log(`Document: ${docNumber}`);
    console.log(`Client: ${doc.client_code}`);
    console.log(`Items: ${doc.items.length}`);
  }
} else {
  console.error('Import failed:', result.error);
  
  if (result.structureErrors) {
    console.error('Structure errors:', result.structureErrors);
  }
  
  if (result.errors && result.errors.length > 0) {
    console.error('Data validation errors:', result.errors);
  }
}
```

## Output Structure

### Successful Import

```javascript
{
  success: true,
  totalRecords: 10,        // Number of unique documents
  totalItems: 45,          // Total line items
  data: {
    "520-2025001258": {
      document_number: "520-2025001258",
      client_code: "ACL IMPE",
      emission_date: "2025-11-25",
      requested_date: "2026-01-16",
      items: [
        {
          item_number: 1,
          ean: "5605250000000",
          requested_quantity: 15,
          // ... other fields
        },
        // ... more items
      ],
      total_quantity: 30
    },
    // ... more documents
  },
  errors: [],              // Items with validation errors
  validationResults: []    // Full validation results for all items
}
```

### Failed Import

```javascript
{
  success: false,
  error: "Structure validation failed: Missing required column: EAN",
  structureErrors: [
    "Missing required column: EAN"
  ]
}
```

## Common Errors and Solutions

### Error: "Failed to parse Excel file"

**Causes:**
- File is not a valid `.xls` file
- File is corrupted
- File is empty

**Solution:** Verify the file format and ensure it's a valid Excel 97-2003 workbook

### Error: "Structure validation failed: Missing required column"

**Causes:**
- Column name misspelled
- Column name has extra spaces
- Column missing from file

**Solution:** 
1. Check column names match exactly (including accents)
2. Remove extra spaces in column headers
3. Ensure all required columns are present

### Error: "Duplicate column found"

**Causes:**
- Same column name appears multiple times (except handled duplicates)

**Solution:** Review column headers and remove unintended duplicates

### Error: Validation Error: "Document number is required"

**Causes:**
- Document number cell is empty
- Document number column name is incorrect

**Solution:** Ensure all rows have a document number value

### Error: Validation Error: "Requested quantity must be greater than 0"

**Causes:**
- Quantity value is 0 or negative

**Solution:** Check source data for valid quantity values

## Testing

Run unit tests:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

Run tests in watch mode:

```bash
npm run test:watch
```

## API Reference

### Functions

#### `parseExcelFile(filePath)`

Parses an Excel file and returns raw headers and data.

**Parameters:**
- `filePath` (string) - Path to the Excel file

**Returns:**
- `{ headers: string[], data: object[] }`

#### `validateStructure(headers)`

Validates that all required columns are present.

**Parameters:**
- `headers` (string[]) - Array of column names

**Returns:**
- `string[]` - Array of error messages (empty if valid)

#### `normalizeData(rawData)`

Normalizes data types and applies transformations.

**Parameters:**
- `rawData` (object[]) - Array of row objects

**Returns:**
- `object[]` - Array of normalized row objects

#### `validateData(data)`

Validates a single data record.

**Parameters:**
- `data` (object) - Row object to validate

**Returns:**
- `{ isValid: boolean, errors: string[] }`

#### `groupItemsByDocument(data)`

Groups items by document number.

**Parameters:**
- `data` (object[]) - Array of normalized row objects

**Returns:**
- `object` - Grouped documents with items arrays

#### `importData(filePath)`

Main function that orchestrates the entire import process.

**Parameters:**
- `filePath` (string) - Path to the Excel file

**Returns:**
- `{ success: boolean, totalRecords: number, totalItems: number, data: object, errors: object[], validationResults: object[] }`

## Notes

- The parser does NOT write to the database - it only processes and structures data
- Data is returned ready for database insertion
- The parser handles Portuguese-specific character encoding issues
- All dates are normalized to ISO 8601 format for consistency
- EAN codes in scientific notation are automatically expanded
- Validation errors are collected and returned, not thrown as exceptions
