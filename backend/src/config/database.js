require('dotenv').config();

const { Sequelize } = require('sequelize');

const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_SSL = process.env.DB_SSL;

const sequelize = new Sequelize(
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    {
        host: DB_HOST,
        dialect: 'postgres',
        port: DB_PORT,
        logging: false,
        dialectOptions: {
            ssl: DB_SSL === 'true' ? {
                require: true,
                rejectUnauthorized: false
            } : false
        },
        
        quoteIdentifiers: true, 
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

async function connectDB() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');

        
        require('../models/User');
        require('../models/Wallet');
        require('../models/Alert');
        require('../models/Transaction');

        
        require('../models/associations');

        
        await sequelize.sync({ alter: true });
        console.log('✅ Modelos do banco de dados sincronizados!');

    } catch (error) {
        console.error('❌ Erro ao conectar ou sincronizar o banco de dados:', error);
        process.exit(1);
    }
}

module.exports = {
    sequelize,
    connectDB
};