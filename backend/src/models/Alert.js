// backend/src/models/Alert.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User'); // Importe o modelo User se ele for usado diretamente aqui para referências

const Alert = sequelize.define('Alert', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: { // Chave estrangeira para o usuário que criou o alerta
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User, // Referencia o modelo User (certifique-se de que User.js exporta o modelo User)
            key: 'id',
        },
    },
    assetSymbol: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    alertType: { // Ex: 'ABOVE', 'BELOW', 'DAILY_REPORT'
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
    // Remova a coluna 'isActive' - ELA NÃO DEVE ESTAR AQUI!
    // isActive: {
    //     type: DataTypes.BOOLEAN,
    //     defaultValue: true,
    // },
    // ADICIONE A COLUNA 'status' - ELA DEVE ESTAR AQUI!
    status: { // Ex: 'ACTIVE', 'TRIGGERED', 'COMPLETED', 'CANCELED'
        type: DataTypes.STRING, // Use STRING para estados como 'ACTIVE'
        defaultValue: 'ACTIVE', // Valor padrão para novos alertas
        allowNull: false,
    },
    reportFrequency: { // Ex: 'daily', 'weekly'
        type: DataTypes.STRING, // Considerar DataTypes.ENUM('daily', 'weekly') para maior controle
        allowNull: true, // Nulo para alertas de preço
    },
    lastReportSentAt: { // Armazena a última vez que um relatório foi enviado
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    timestamps: true, // createdAt, updatedAt
    tableName: 'Alerts', // Boa prática especificar o nome da tabela
});

// As associações devem ser definidas no arquivo 'associations.js'
// para garantir que todos os modelos estejam carregados antes de associá-los.
// REMOVA QUALQUER ASSOCIAÇÃO DAQUI SE VOCÊ TEM UM 'associations.js' SEPARADO.
// User.hasMany(Alert, { foreignKey: 'userId'});
// Alert.belongsTo(User, { foreignKey: 'userId', onDelet: 'CASCADE' });

module.exports = Alert;
