require('dotenv').config();
const { createAdminUser } = require('../services/userService');

/**
 * Script para criar utilizador admin padrão
 */
async function seedAdmin() {
  try {
    console.log('🔧 Iniciando criação do utilizador admin...');
    
    const adminEmail = 'admin@encomendas.local';
    const adminPassword = 'admin123';
    const adminFirstName = 'Admin';
    const adminLastName = 'Sistema';

    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log(`👤 Nome: ${adminFirstName} ${adminLastName}`);

    const admin = await createAdminUser({
      email: adminEmail,
      password: adminPassword,
      firstName: adminFirstName,
      lastName: adminLastName
    });

    console.log('✅ Utilizador admin criado com sucesso!');
    console.log(`📊 ID: ${admin.id}`);
    console.log(`📧 Email: ${admin.email}`);
    console.log(`👑 Role: ${admin.role}`);
    console.log(`🕐 Criado em: ${admin.createdAt}`);
    
    console.log('\n🔐 Credenciais de acesso:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('\n⚠️  IMPORTANTE: Altere a password após o primeiro login!');
    
    return admin;

  } catch (error) {
    console.error('❌ Erro ao criar utilizador admin:', error.message);
    throw error;
  }
}

/**
 * Executar seed se chamado diretamente
 */
if (require.main === module) {
  seedAdmin()
    .then(() => {
      console.log('\n🎉 Seed do admin concluído com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Falha no seed do admin:', error.message);
      process.exit(1);
    });
}

module.exports = { seedAdmin };