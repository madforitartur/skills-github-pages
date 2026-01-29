const EXPECTED_COLUMNS = [
  'Nr.Documento',
  'Terceiro',
  'Data Emissão',
  'Data Pedida',
  'Item',
  'PO',
  'Cod.Artigo',
  'Referencia',
  'Cor',
  'Descricao',
  'Tam',
  'Familia',
  'Familia',
  'EAN',
  'Qtd Pedida',
  'Data Tec.',
  'Felpo Cru',
  'Data F.Cru',
  'Tinturaria',
  'Data Tint.',
  'Confeccao Roupoes',
  'Confeccao Felpos',
  'Data Conf.',
  'Emb./Acab.',
  'Data Arm. Exp.',
  'Stock Cx.',
  'Data Ent.',
  'Data Especial.',
  'Data Printer.',
  'Data Debuxo.',
  'Data Amostras.',
  'Data Bordados.',
  'Facturada',
  'Em Aberto'
];

const COLUMN_MAPPING = {
  'Nr.Documento': 'document_number',
  'Terceiro': 'client_code',
  'Data Emissão': 'emission_date',
  'Data Pedida': 'requested_date',
  'Item': 'item_number',
  'PO': 'po_number',
  'Cod.Artigo': 'product_code',
  'Referencia': 'reference',
  'Cor': 'color_code',
  'Tam': 'size_code',
  'Familia': 'family',
  'EAN': 'ean',
  'Qtd Pedida': 'requested_quantity',
  'Data Tec.': 'tech_date',
  'Felpo Cru': 'felpo_cru',
  'Data F.Cru': 'felpo_cru_date',
  'Tinturaria': 'tinturaria',
  'Data Tint.': 'tinturaria_date',
  'Confeccao Roupoes': 'confeccao_roupoes',
  'Confeccao Felpos': 'confeccao_felpos',
  'Data Conf.': 'confeccao_date',
  'Emb./Acab.': 'emb_acab',
  'Data Arm. Exp.': 'arm_exp_date',
  'Stock Cx.': 'stock_caixa',
  'Data Ent.': 'ent_date',
  'Data Especial.': 'especial_date',
  'Data Printer.': 'printer_date',
  'Data Debuxo.': 'debuxo_date',
  'Data Amostras.': 'amostras_date',
  'Data Bordados.': 'bordados_date',
  'Facturada': 'facturada',
  'Em Aberto': 'em_aberto'
};

const DUPLICATE_COLUMN_INDICES = {
  'Descricao': ['cor_descricao', 'tamanho_descricao'],
  'Familia': ['family']
};

function getExpectedColumns() {
  return EXPECTED_COLUMNS;
}

function getColumnMapping() {
  return COLUMN_MAPPING;
}

function getDuplicateColumnIndices() {
  return DUPLICATE_COLUMN_INDICES;
}

module.exports = {
  EXPECTED_COLUMNS,
  COLUMN_MAPPING,
  DUPLICATE_COLUMN_INDICES,
  getExpectedColumns,
  getColumnMapping,
  getDuplicateColumnIndices
};
