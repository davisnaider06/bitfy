
require('dotenv').config(); 

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres', 
    port: process.env.DB_PORT, 
    logging: false,
    dialectOptions: {
        ssl: process.env.DB_SSL === 'true' ? {
            require: true,
            rejectUnauthorized: false // Para ambientes de desenvolvimento/teste com SSL self-signed
        } : false
    },
  }
);

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
    
    await sequelize.sync();
    console.log('✅ Modelos do banco de dados sincronizados!');
  } catch (error) {
    console.error('❌ Erro ao conectar ou sincronizar o banco de dados:', error);
    process.exit(1); 
  }
}

module.exports = { sequelize, connectDB };