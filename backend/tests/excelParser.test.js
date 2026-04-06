const { 
  parseExcelFile,
  validateStructure,
  normalizeData,
  validateData,
  groupItemsByDocument,
  fixEncoding,
  normalizeEAN,
  normalizeDate,
  normalizeNumber,
  normalizeString,
  importData
} = require('../services/excelParser');

describe('Excel Parser', () => {
  
  describe('fixEncoding', () => {
    test('should fix corrupted characters', () => {
      expect(fixEncoding('Emiss鉶')).toBe('Emissão');
      expect(fixEncoding('Test 陌')).toBe('Test da');
    });
    
    test('should return null for null input', () => {
      expect(fixEncoding(null)).toBe(null);
    });
    
    test('should return unchanged string for valid input', () => {
      expect(fixEncoding('Valid String')).toBe('Valid String');
    });
  });
  
  describe('normalizeEAN', () => {
    test('should convert scientific notation to string', () => {
      expect(normalizeEAN('5.60525E+12')).toBe('5605250000000');
      expect(normalizeEAN('1.23E+10')).toBe('12300000000');
    });
    
    test('should handle lowercase e notation', () => {
      expect(normalizeEAN('5.60525e+12')).toBe('5605250000000');
    });
    
    test('should return null for empty values', () => {
      expect(normalizeEAN('')).toBe(null);
      expect(normalizeEAN(null)).toBe(null);
      expect(normalizeEAN(undefined)).toBe(null);
    });
    
    test('should handle regular EAN strings', () => {
      expect(normalizeEAN('5605250000000')).toBe('5605250000000');
      expect(normalizeEAN('1234567890123')).toBe('1234567890123');
    });
  });
  
  describe('normalizeDate', () => {
    test('should convert MM/DD/YYYY to YYYY-MM-DD', () => {
      expect(normalizeDate('11/25/2025')).toBe('2025-11-25');
      expect(normalizeDate('1/5/2026')).toBe('2026-01-05');
    });
    
    test('should return YYYY-MM-DD unchanged', () => {
      expect(normalizeDate('2025-11-25')).toBe('2025-11-25');
    });
    
    test('should return null for empty values', () => {
      expect(normalizeDate('')).toBe(null);
      expect(normalizeDate(null)).toBe(null);
      expect(normalizeDate(undefined)).toBe(null);
    });
    
    test('should handle Date objects', () => {
      const date = new Date('2025-11-25');
      expect(normalizeDate(date)).toBe('2025-11-25');
    });
    
    test('should return null for invalid date strings', () => {
      expect(normalizeDate('invalid')).toBe(null);
      expect(normalizeDate('not-a-date')).toBe(null);
    });
  });
  
  describe('normalizeNumber', () => {
    test('should convert string numbers to floats', () => {
      expect(normalizeNumber('123')).toBe(123);
      expect(normalizeNumber('45.67')).toBe(45.67);
    });
    
    test('should return null for empty values', () => {
      expect(normalizeNumber('')).toBe(null);
      expect(normalizeNumber(null)).toBe(null);
      expect(normalizeNumber(undefined)).toBe(null);
    });
    
    test('should return null for invalid numbers', () => {
      expect(normalizeNumber('abc')).toBe(null);
      expect(normalizeNumber('not-a-number')).toBe(null);
    });
  });
  
  describe('normalizeString', () => {
    test('should trim whitespace', () => {
      expect(normalizeString('  test  ')).toBe('test');
      expect(normalizeString('test ')).toBe('test');
    });
    
    test('should return null for empty strings', () => {
      expect(normalizeString('')).toBe(null);
      expect(normalizeString('   ')).toBe(null);
    });
    
    test('should return null for null/undefined', () => {
      expect(normalizeString(null)).toBe(null);
      expect(normalizeString(undefined)).toBe(null);
    });
    
    test('should fix encoding in strings', () => {
      expect(normalizeString('Emiss鉶')).toBe('Emissão');
    });
  });
  
  describe('validateStructure', () => {
    test('should pass with valid headers', () => {
      const headers = [
        'Nr.Documento',
        'Terceiro',
        'Data Emissão',
        'Data Pedida',
        'Item',
        'PO',
        'Cod.Artigo',
        'Referencia',
        'Cor',
        'Tam',
        'EAN',
        'Qtd Pedida'
      ];
      const errors = validateStructure(headers);
      expect(errors.length).toBe(0);
    });
    
    test('should detect missing columns', () => {
      const headers = ['Nr.Documento', 'Terceiro'];
      const errors = validateStructure(headers);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.includes('Missing'))).toBe(true);
    });
    
    test('should detect duplicate columns', () => {
      const headers = ['Nr.Documento', 'Terceiro', 'Terceiro'];
      const errors = validateStructure(headers);
      expect(errors.some(e => e.includes('Duplicate'))).toBe(true);
    });
  });
  
  describe('normalizeData', () => {
    test('should normalize all data fields correctly', () => {
      const rawData = [
        {
          'document_number': '520-2025001258',
          'client_code': 'ACL IMPE',
          'emission_date': '11/25/2025',
          'requested_date': '01/16/2026',
          'ean': '5.60525E+12',
          'requested_quantity': '30',
          'item_number': '1'
        }
      ];
      
      const normalized = normalizeData(rawData);
      
      expect(normalized[0].document_number).toBe('520-2025001258');
      expect(normalized[0].emission_date).toBe('2025-11-25');
      expect(normalized[0].requested_date).toBe('2026-01-16');
      expect(normalized[0].ean).toBe('5605250000000');
      expect(normalized[0].requested_quantity).toBe(30);
      expect(normalized[0].item_number).toBe(1);
    });
    
    test('should handle empty fields', () => {
      const rawData = [
        {
          'document_number': '520-2025001258',
          'ean': '',
          'requested_quantity': ''
        }
      ];
      
      const normalized = normalizeData(rawData);
      
      expect(normalized[0].ean).toBe(null);
      expect(normalized[0].requested_quantity).toBe(null);
    });
  });
  
  describe('validateData', () => {
    test('should validate correct data', () => {
      const data = {
        document_number: '520-2025001258',
        emission_date: '2025-11-25',
        requested_quantity: 30
      };
      
      const result = validateData(data);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
    
    test('should reject missing document number', () => {
      const data = {
        emission_date: '2025-11-25',
        requested_quantity: 30
      };
      
      const result = validateData(data);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Document number'))).toBe(true);
    });
    
    test('should reject missing emission date', () => {
      const data = {
        document_number: '520-2025001258',
        requested_quantity: 30
      };
      
      const result = validateData(data);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Emission date'))).toBe(true);
    });
    
    test('should reject negative or zero requested quantity', () => {
      const data = {
        document_number: '520-2025001258',
        emission_date: '2025-11-25',
        requested_quantity: 0
      };
      
      const result = validateData(data);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Requested quantity'))).toBe(true);
    });
  });
  
  describe('groupItemsByDocument', () => {
    test('should group items by document number', () => {
      const data = [
        {
          document_number: '520-2025001258',
          client_code: 'ACL IMPE',
          emission_date: '2025-11-25',
          requested_date: '2026-01-16',
          item_number: 1,
          ean: '5605250000000',
          requested_quantity: 15
        },
        {
          document_number: '520-2025001258',
          client_code: 'ACL IMPE',
          emission_date: '2025-11-25',
          requested_date: '2026-01-16',
          item_number: 2,
          ean: '5605250000001',
          requested_quantity: 15
        }
      ];
      
      const grouped = groupItemsByDocument(data);
      
      expect(Object.keys(grouped).length).toBe(1);
      expect(grouped['520-2025001258']).toBeDefined();
      expect(grouped['520-2025001258'].items.length).toBe(2);
      expect(grouped['520-2025001258'].total_quantity).toBe(30);
    });
    
    test('should handle multiple documents', () => {
      const data = [
        {
          document_number: 'DOC-001',
          client_code: 'CLIENT A',
          emission_date: '2025-11-25',
          requested_quantity: 10
        },
        {
          document_number: 'DOC-002',
          client_code: 'CLIENT B',
          emission_date: '2025-11-26',
          requested_quantity: 20
        }
      ];
      
      const grouped = groupItemsByDocument(data);
      
      expect(Object.keys(grouped).length).toBe(2);
      expect(grouped['DOC-001'].total_quantity).toBe(10);
      expect(grouped['DOC-002'].total_quantity).toBe(20);
    });
  });
  
  describe('validateStructure with corrupted headers', () => {
    test('should handle corrupted column names', () => {
      const headers = [
        'Nr.Documento',
        'Terceiro',
        'Data Emiss鉶',
        'Data Pedida'
      ];
      
      const errors = validateStructure(headers);
      expect(errors.length).toBe(0);
    });
  });
  
  describe('normalizeData with various data types', () => {
    test('should handle null and undefined values', () => {
      const rawData = [
        {
          'document_number': null,
          'ean': undefined,
          'requested_quantity': ''
        }
      ];
      
      const normalized = normalizeData(rawData);
      
      expect(normalized[0].document_number).toBe(null);
      expect(normalized[0].ean).toBe(null);
      expect(normalized[0].requested_quantity).toBe(null);
    });
  });
});
