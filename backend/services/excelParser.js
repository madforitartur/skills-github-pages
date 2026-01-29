const XLSX = require('xlsx');
const iconv = require('iconv-lite');
const { 
  EXPECTED_COLUMNS, 
  COLUMN_MAPPING, 
  DUPLICATE_COLUMN_INDICES 
} = require('../validators/excelValidator');

function fixEncoding(text) {
  if (!text || typeof text !== 'string') return text;
  
  const fixes = {
    '鉶': 'ão',
    '陌': 'da',
    'ã£o': 'ão',
    'Emiss鉶': 'Emissão',
    'Descri莽茫o': 'Descrição',
    'Data Ped.': 'Data Pedida',
    'Data Tint.': 'Data Tint.',
    'Data Tec.': 'Data Tec.',
    'Confec莽茫o': 'Confecção',
    'Embalagem': 'Emb./Acab.',
    'Tinturaria': 'Tinturaria',
    'Entrega': 'Data Ent.',
    'Felpo': 'Felpo Cru',
    'Roup玫es': 'Roupões',
    'Felpos': 'Felpos'
  };
  
  let result = text;
  for (const [wrong, correct] of Object.entries(fixes)) {
    result = result.replace(new RegExp(wrong, 'g'), correct);
  }
  return result;
}

function normalizeEAN(value) {
  if (value === null || value === undefined || value === '') return null;
  
  if (typeof value === 'string') {
    value = value.trim();
    if (value === '') return null;
  }
  
  const strValue = String(value);
  if (strValue.includes('E+') || strValue.includes('e+')) {
    const num = parseFloat(value);
    return isNaN(num) ? null : Math.round(num).toString();
  }
  
  const num = parseFloat(value);
  return isNaN(num) ? strValue : num.toString();
}

function normalizeDate(dateStr) {
  if (!dateStr || dateStr === '') return null;
  
  if (dateStr instanceof Date) {
    const year = dateStr.getFullYear();
    const month = String(dateStr.getMonth() + 1).padStart(2, '0');
    const day = String(dateStr.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  if (typeof dateStr === 'number') {
    const date = new Date(Math.round((dateStr - 25569) * 86400 * 1000));
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  const strValue = String(dateStr).trim();
  if (strValue === '') return null;
  
  const parts = strValue.split('/');
  if (parts.length === 3) {
    const [part1, part2, part3] = parts;
    if (part1.length === 4) {
      return `${part1}-${String(part2).padStart(2, '0')}-${String(part3).padStart(2, '0')}`;
    } else if (part3.length === 4) {
      return `${part3}-${String(part1).padStart(2, '0')}-${String(part2).padStart(2, '0')}`;
    }
  }
  
  if (strValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return strValue;
  }
  
  return null;
}

function normalizeNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

function normalizeString(value) {
  if (value === null || value === undefined) return null;
  
  const strValue = String(value).trim();
  if (strValue === '') return null;
  
  return fixEncoding(strValue);
}

function parseExcelFile(filePath) {
  try {
    const workbook = XLSX.readFile(filePath, { 
      type: 'file',
      cellDates: true,
      cellText: false
    });
    
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    const rawData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: null,
      raw: false
    });
    
    if (rawData.length === 0) {
      throw new Error('Excel file is empty');
    }
    
    const headers = rawData[0].map(h => normalizeString(h));
    const data = rawData.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        if (header !== null) {
          obj[header] = row[index];
        }
      });
      return obj;
    });
    
    return {
      headers,
      data
    };
  } catch (error) {
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
}

function validateStructure(headers) {
  const errors = [];
  const normalizedHeaders = headers.map(h => fixEncoding(h || ''));
  
  const fixedExpectedColumns = EXPECTED_COLUMNS.map(col => fixEncoding(col));
  
  for (const expectedCol of fixedExpectedColumns) {
    if (!normalizedHeaders.includes(expectedCol)) {
      errors.push(`Missing required column: ${expectedCol}`);
    }
  }
  
  const headerCounts = {};
  normalizedHeaders.forEach(h => {
    headerCounts[h] = (headerCounts[h] || 0) + 1;
  });
  
  for (const [header, count] of Object.entries(headerCounts)) {
    if (count > 1) {
      errors.push(`Duplicate column found: ${header} (${count} occurrences)`);
    }
  }
  
  return errors;
}

function mapColumns(headers, rawData) {
  const mappedData = [];
  const normalizedHeaders = headers.map(h => fixEncoding(h || ''));
  
  let descricaoIndex = 0;
  let familiaIndex = 0;
  
  for (const row of rawData) {
    const mappedRow = {};
    
    normalizedHeaders.forEach((header, index) => {
      let targetField = COLUMN_MAPPING[header];
      
      if (!targetField) {
        if (header === 'Descricao' || header === 'Descricao (cor)') {
          if (descricaoIndex === 0) {
            targetField = 'cor_descricao';
          } else {
            targetField = 'tamanho_descricao';
          }
          descricaoIndex++;
        } else if (header === 'Familia') {
          if (familiaIndex === 0) {
            targetField = 'family';
          } else {
            targetField = `family_${familiaIndex}`;
          }
          familiaIndex++;
        } else {
          targetField = header.toLowerCase().replace(/[^a-z0-9]/g, '_');
        }
      }
      
      mappedRow[targetField] = row[header];
    });
    
    mappedData.push(mappedRow);
  }
  
  return mappedData;
}

function normalizeData(rawData) {
  return rawData.map(row => {
    const normalized = {};
    
    for (const [key, value] of Object.entries(row)) {
      if (key === 'ean') {
        normalized[key] = normalizeEAN(value);
      } else if (key.includes('date') || key.includes('data')) {
        normalized[key] = normalizeDate(value);
      } else if (key.includes('quantity') || key.includes('qtd') || key.includes('quantity')) {
        normalized[key] = normalizeNumber(value);
      } else if (key.includes('item') || key.includes('number')) {
        if (key !== 'document_number' && key !== 'po_number') {
          normalized[key] = normalizeNumber(value);
        } else {
          normalized[key] = normalizeString(value);
        }
      } else {
        normalized[key] = normalizeString(value);
      }
    }
    
    return normalized;
  });
}

function validateData(data) {
  const errors = [];
  
  if (!data.document_number) {
    errors.push('Document number is required');
  }
  
  if (!data.emission_date) {
    errors.push('Emission date is required');
  }
  
  if (data.requested_quantity !== null && data.requested_quantity !== undefined) {
    if (data.requested_quantity <= 0) {
      errors.push('Requested quantity must be greater than 0');
    }
  }
  
  const quantityFields = Object.keys(data).filter(key => 
    key.includes('quantity') || key.includes('qtd')
  );
  
  for (const field of quantityFields) {
    const value = data[field];
    if (value !== null && value !== undefined && value < 0) {
      errors.push(`${field} must be >= 0`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

function groupItemsByDocument(data) {
  const grouped = {};
  
  for (const item of data) {
    const docNumber = item.document_number;
    
    if (!grouped[docNumber]) {
      grouped[docNumber] = {
        document_number: docNumber,
        client_code: item.client_code,
        emission_date: item.emission_date,
        requested_date: item.requested_date,
        items: [],
        total_quantity: 0
      };
    }
    
    grouped[docNumber].items.push(item);
    
    if (item.requested_quantity) {
      grouped[docNumber].total_quantity += item.requested_quantity;
    }
  }
  
  return grouped;
}

async function importData(filePath) {
  try {
    const { headers, data: rawData } = parseExcelFile(filePath);
    
    const structureErrors = validateStructure(headers);
    if (structureErrors.length > 0) {
      return {
        success: false,
        error: `Structure validation failed: ${structureErrors.join(', ')}`,
        structureErrors
      };
    }
    
    const mappedData = mapColumns(headers, rawData);
    
    const normalizedData = normalizeData(mappedData);
    
    const validationResults = normalizedData.map(validateData);
    
    const hasErrors = validationResults.some(r => !r.isValid);
    
    const groupedData = groupItemsByDocument(normalizedData);
    
    return {
      success: !hasErrors,
      totalRecords: Object.keys(groupedData).length,
      totalItems: normalizedData.length,
      data: groupedData,
      errors: validationResults.filter(r => !r.isValid),
      validationResults
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  parseExcelFile,
  validateStructure,
  mapColumns,
  normalizeData,
  validateData,
  groupItemsByDocument,
  importData,
  fixEncoding,
  normalizeEAN,
  normalizeDate,
  normalizeNumber,
  normalizeString
};
