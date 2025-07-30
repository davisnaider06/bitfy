const User = require('./User');
const Wallet = require('./Wallet');
const Transaction = require('./Transaction'); 
const Alert = require('./Alert');

//wallet
User.hasMany(Wallet, { foreignKey: 'userId', as: 'wallets' });
Wallet.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

//trasaction
User.hasMany(Transaction, { foreignKey: 'userId', as: 'userTransactions' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'transactionUser' });

if (Wallet && Transaction) {
    Wallet.hasMany(Transaction, { foreignKey: 'walletId', as: 'walletTransactions' });
    Transaction.belongsTo(Wallet, { foreignKey: 'walletId', as: 'originWallet' });
}


User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Wallet.hasMany(Transaction, { foreignKey: 'walletId', as: 'transactions' });
Transaction.belongsTo(Wallet, { foreignKey: 'walletId', as: 'wallet' });


//alert
User.hasMany(Alert, { foreignKey: 'userId', as: 'alerts' });
Alert.belongsTo(User, { foreignKey: 'userId', as: 'alertUser' });

console.log('✅ Associações de modelos carregadas.');
