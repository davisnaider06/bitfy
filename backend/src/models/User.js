
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID, 
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

   role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "user"
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  whatsappNumber: { 
    type: DataTypes.STRING,
    allowNull: false, 
    unique: true, 
  },

 resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true, //preenchido quando um token for gerado
    },
    resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true, 
    }
    
}, {
    timestamps: true, //createdAt updatedAt
    tableName: 'users', 
});


User.beforeCreate(async (user) => {
    if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
    }
});

//comparar senhas
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;