const { importData } = require('./services/excelParser');

async function exampleUsage() {
  console.log('Excel Parser Example\n====================\n');

  const filePath = './data/orders.xls';

  try {
    console.log(`Parsing file: ${filePath}`);
    const result = await importData(filePath);

    if (result.success) {
      console.log('\n✅ Import successful!');
      console.log(`📊 Total documents: ${result.totalRecords}`);
      console.log(`📦 Total items: ${result.totalItems}`);
      
      if (result.errors && result.errors.length > 0) {
        console.log(`\n⚠️  Items with validation errors: ${result.errors.length}`);
        result.errors.forEach((error, index) => {
          console.log(`\nError ${index + 1}:`);
          console.log(JSON.stringify(error, null, 2));
        });
      }
      
      console.log('\n📋 Document Summary:');
      for (const [docNumber, doc] of Object.entries(result.data)) {
        console.log(`\nDocument: ${docNumber}`);
        console.log(`  Client: ${doc.client_code}`);
        console.log(`  Emission Date: ${doc.emission_date}`);
        console.log(`  Requested Date: ${doc.requested_date || 'N/A'}`);
        console.log(`  Total Quantity: ${doc.total_quantity}`);
        console.log(`  Items: ${doc.items.length}`);
        
        if (doc.items.length > 0) {
          console.log('\n  Sample Item:');
          const item = doc.items[0];
          console.log(`    Item Number: ${item.item_number || 'N/A'}`);
          console.log(`    EAN: ${item.ean || 'N/A'}`);
          console.log(`    Requested Quantity: ${item.requested_quantity || 'N/A'}`);
          console.log(`    Product Code: ${item.product_code || 'N/A'}`);
          console.log(`    Reference: ${item.reference || 'N/A'}`);
        }
      }
      
      console.log('\n\nData is ready for database insertion!');
      
      return result;
    } else {
      console.log('\n❌ Import failed!');
      console.log(`Error: ${result.error}`);
      
      if (result.structureErrors) {
        console.log('\n🔍 Structure Validation Errors:');
        result.structureErrors.forEach(err => console.log(`  - ${err}`));
      }
      
      return null;
    }
  } catch (error) {
    console.error('\n💥 Unexpected error:', error.message);
    return null;
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  exampleUsage()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { exampleUsage };
