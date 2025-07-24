const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User'); 

const Alert = sequelize.define('Alert', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: { //Chave estrangeira para o usuário que criou o alerta
        type: DataTypes.UUID,
        allowNull: false,
        references: { 
            model: User, 
            key: 'id',
        },
    },
    assetSymbol: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    alertType: { // Ex 'ABOVE', 'BELOW', 'DAILY_REPORT'
        type: DataTypes.STRING,
        allowNull: false,
    },
    triggerPrice: {
        type: DataTypes.FLOAT,
        allowNull: true, 
    },
    whatsappNumber: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    messageSent: { // Para alertas ABOVE/BELOW, indica se a mensagem já foi enviada
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },

    reportFrequency: { // Ex 'daily', 'weekly'
        type: DataTypes.STRING, // Consider using DataTypes.ENUM('daily', 'weekly') for strictness
        allowNull: true, // Nulo para alertas de preço
    },
    lastReportSentAt: { // Armazena a última vez que um relatório foi enviado
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    timestamps: true, // createdAt, updatedAt
    tableName: 'alerts', 
});


// Define a associação entre User e Alert
User.hasMany(Alert, { foreignKey: 'userId', onDelete: 'CASCADE' });
Alert.belongsTo(User, { foreignKey: 'userId' });

module.exports = Alert;