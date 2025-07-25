const express = require('express');
const router = express.Router();
const { getCoinsList, getCoinChart } = require('../controllers/cryptoController');

router.get('/list', getCoinsList);
router.get('/:id/chart', getCoinChart); //ex /api/crypto/bitcoin/chart?days=7&vs_currency=brl

module.exports = router;