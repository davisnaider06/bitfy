// backend/src/models/Wallet.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Wallet = sequelize.define('Wallet', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    type: {
        type: DataTypes.ENUM('real', 'demo'),
        allowNull: false,
        defaultValue: 'real',
    },
    BRL: {
            type: DataTypes.DECIMAL(20, 8),
            allowNull: false,
            defaultValue: '10000.00', 
            get() {
                const rawValue = this.getDataValue('BRL');
                return rawValue ? parseFloat(rawValue) : 0;
            },
            set(value) {
                this.setDataValue('BRL', value !== null ? parseFloat(value).toFixed(8) : '0.00000000');
            }
        },
    assets: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
        get() {
            const rawValue = this.getDataValue('assets');
            if (rawValue && typeof rawValue === 'object') {
                const parsedAssets = {};
                for (const key in rawValue) {
                    parsedAssets[key] = parseFloat(rawValue[key] || 0);
                }
                return parsedAssets;
            }
            return {};
        },
        set(value) {
            const serializedAssets = {};
            if (value && typeof value === 'object') {
                for (const key in value) {
                    serializedAssets[key] = parseFloat(value[key] || 0).toFixed(8);
                }
            }
            this.setDataValue('assets', serializedAssets);
        }
    }
}, {
    tableName: 'Wallets',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'type'],
            name: 'unique_user_wallet_type'
        }
    ]
});

module.exports = Wallet;