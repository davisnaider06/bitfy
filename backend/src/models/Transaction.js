const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User'); 
const Wallet = require('./Wallet'); 

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: { // ID do usuário que realizou a transação
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    walletId: { // ID da carteira envolvida na transação
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Wallet,
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    type: { // Tipo da transação: 'DEPOSIT', 'WITHDRAW', 'BUY', 'SELL'
        type: DataTypes.ENUM('DEPOSIT', 'WITHDRAW', 'BUY', 'SELL'),
        allowNull: false,
    },
    assetSymbol: { // Símbolo do ativo (ex: 'BTC', 'ETH', 'BRL' para depósitos/saques)
        type: DataTypes.STRING,
        allowNull: false,
    },
    amount: { // Quantidade do ativo transacionado (ex: 0.001 BTC, 500 BRL)
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    price: { // Preço do ativo no momento da transação (para BUY/SELL)
        type: DataTypes.FLOAT,
        allowNull: true, // Pode ser nulo para DEPOSIT/WITHDRAW
    },
    BRLAmount: { // Valor total em BRL da transação (ex: 50000.00 BRL para 0.001 BTC)
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    status: { // Status da transação: 'COMPLETED', 'PENDING', 'FAILED'
        type: DataTypes.ENUM('COMPLETED', 'PENDING', 'FAILED'),
        defaultValue: 'COMPLETED',
        allowNull: false,
    },
    // Você pode adicionar mais campos como 'transactionHash' para blockchain, 'fee', etc.
}, {
    timestamps: true, // createdAt, updatedAt
    tableName: 'Transactions',
});

module.exports = Transaction;
