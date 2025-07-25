// backend/models/Wallet.js - Versão para Sequelize e PostgreSQL
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User'); // Importa o modelo User para a associação

const Wallet = sequelize.define('Wallet', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: { // Chave estrangeira para o User
        type: DataTypes.UUID,
        references: {
            model: User,
            key: 'id'
        },
        allowNull: false,
        unique: true // Cada usuário tem apenas uma entrada de carteira
    },
    BRL: {
        type: DataTypes.DECIMAL(20, 2), // 2 casas decimais para BRL
        defaultValue: 0.00,
        allowNull: false,
        validate: {
            min: {
                args: [0],
                msg: 'Saldo BRL não pode ser negativo'
            }
        }
    },
    // Usaremos um tipo JSONB para armazenar os ativos como um objeto
    // Ex: { "BTC": "0.05", "ETH": "1.2" }
    // Os valores serão strings para manter a precisão com DECIMAL
    assets: {
        type: DataTypes.JSONB,
        defaultValue: {},
        allowNull: false,
        get() {
            // Ao obter, convertemos os valores para números (se possível e necessário)
            const rawValue = this.getDataValue('assets');
            if (rawValue && typeof rawValue === 'object') {
                const parsedAssets = {};
                for (const key in rawValue) {
                    parsedAssets[key] = parseFloat(rawValue[key]); // Converte para float ao ler
                }
                return parsedAssets;
            }
            return {};
        },
        set(value) {
            // Ao definir, garantimos que os valores são strings para DECIMAL ou mantemos como estão
            const stringifiedAssets = {};
            if (value && typeof value === 'object') {
                for (const key in value) {
                    stringifiedAssets[key] = String(value[key]); // Converte para string ao escrever
                }
            }
            this.setDataValue('assets', stringifiedAssets);
        }
    }
}, {
    timestamps: true, // Adiciona createdAt e updatedAt
    updatedAt: 'updatedAt' // Nome da coluna para updatedAt
});

// Define a associação: Uma Carteira pertence a um Usuário
Wallet.belongsTo(User, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE' });
User.hasOne(Wallet, { foreignKey: 'userId', as: 'wallet' });

module.exports = Wallet;