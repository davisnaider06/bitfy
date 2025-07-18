// backend/src/models/Alert.js
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
      model: User, //Referencia o modelo User
      key: 'id',
    },
  },
  assetSymbol: { //Símbolo do ativo (ex: 'BTCUSDT', 'ETHBRL')
    type: DataTypes.STRING,
    allowNull: false,
  },
  triggerPrice: { //Preço que irá disparar o alerta
    type: DataTypes.DECIMAL(20, 8), // DECIMAL para precisão financeira
    allowNull: false,
  },
  alertType: { //Tipo de alerta: 'ABOVE', 'BELOW', 'DAILY_REPORT'
    type: DataTypes.ENUM('ABOVE', 'BELOW', 'DAILY_REPORT'),
    allowNull: false,
  },
  status: { //Status do alerta: 'ACTIVE', 'TRIGGERED', 'INACTIVE'
    type: DataTypes.ENUM('ACTIVE', 'TRIGGERED', 'INACTIVE'),
    defaultValue: 'ACTIVE',
  },
  lastTriggeredAt: { //Última vez que o alerta foi disparado (para evitar spam)
    type: DataTypes.DATE,
    allowNull: true,
  },
  messageSent: { //indica se a mensagem já foi enviada
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  whatsappNumber: { //Número de WhatsApp para o alerta
    type: DataTypes.STRING,
    allowNull: true, //ou false se for obrigatório
  },
}, {
  tableName: 'alerts', //nome da tabela
  timestamps: true, // createdAt, updatedAt
});

//define a associação entre User e Alert
User.hasMany(Alert, { foreignKey: 'userId', onDelete: 'CASCADE' });
Alert.belongsTo(User, { foreignKey: 'userId' });

module.exports = Alert;