// backend/sync-db.js
// Este script é usado para forçar a sincronização do banco de dados,
// recriando todas as tabelas do zero.
// Use com CUIDADO, pois ele APAGA TODOS OS DADOS EXISTENTES.

require('dotenv').config(); // Carrega variáveis de ambiente

const { sequelize } = require('./src/config/database'); // Importa a instância do Sequelize

// Importa todos os modelos para que o Sequelize os conheça
require('./src/models/User');
require('./src/models/Wallet');
require('./src/models/Transaction');
require('./src/models/Alert');

// Importa as associações
require('./src/models/associations');

async function forceSyncDatabase() {
    try {
        console.log('Iniciando sincronização forçada do banco de dados...');
        // O método .sync({ force: true }) irá dropar todas as tabelas e recriá-las.
        await sequelize.sync({ force: true });
        console.log('✅ Banco de dados sincronizado com sucesso (tabelas recriadas)!');
        process.exit(0); // Sai com sucesso
    } catch (error) {
        console.error('❌ Erro durante a sincronização forçada do banco de dados:', error);
        process.exit(1); // Sai com erro
    }
}

forceSyncDatabase();
