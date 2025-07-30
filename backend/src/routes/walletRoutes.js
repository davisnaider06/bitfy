const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
    depositFunds,
    withdrawFunds,
    buyAsset,
    sellAsset,
    getTransactions,
    getWalletBalance,
} = require('../controllers/walletController');

const router = express.Router();

// Todas as rotas de carteira precisam de proteção (autenticação)
router.use(protect);

// Rotas para operações de fundos
router.post('/deposit', depositFunds);
router.post('/withdraw', withdrawFunds);

// Rotas para operações de compra e venda de ativos
router.post('/buy', buyAsset);
router.post('/sell', sellAsset);

// Rotas para obter dados da carteira
router.get('/transactions', getTransactions); // Histórico de transações
router.get('/balance', getWalletBalance); // Saldo da carteira (BRL e ativos)

module.exports = router;
