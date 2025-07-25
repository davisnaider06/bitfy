const express = require('express');
const { processTrade, getTransactionHistory, getUserWallet } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Todas as rotas de transação são protegidas
router.post('/trade', protect, processTrade);
router.get('/history', protect, getTransactionHistory);
router.get('/wallet', protect, getUserWallet); // Para obter o saldo da carteira para o Dashboard

module.exports = router;