const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User'); 

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        references: {
            model: User,
            key: 'id'
        },
        allowNull: false
    },
    type: { // 'buy', 'sell', 'deposit', 'withdraw'
        type: DataTypes.ENUM('buy', 'sell', 'deposit', 'withdraw'),
        allowNull: false
    },
    assetSymbol: { // Ex: BTCUSDT. Null para deposit/withdraw de BRL
        type: DataTypes.STRING,
        allowNull: true // Pode ser nulo para depósito/saque de BRL
    },
    amount: { // Quantidade da cripto (para buy/sell) ou BRL (para deposit/withdraw)
        type: DataTypes.DECIMAL(20, 8), // Para precisão
        allowNull: false,
        validate: {
            min: {
                args: [0],
                msg: 'Quantidade não pode ser negativa'
            }
        }
    },
    priceAtExecution: {
        type: DataTypes.DECIMAL(20, 8),
        allowNull: true
    },
    fiatAmount: { 
        type: DataTypes.DECIMAL(20, 2), 
        allowNull: true
    },
    status: { // 'completed', 'pending', 'failed'
        type: DataTypes.ENUM('completed', 'pending', 'failed'),
        defaultValue: 'completed',
        allowNull: false
    }
}, {
    timestamps: true 
});


Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE' }); // <--- ADICIONE onDelete: 'CASCADE' AQUI!
User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });

module.exports = Transaction;