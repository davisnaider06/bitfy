const express = require('express');
const { getMarketPrice } = require('../controllers/marketDataController');


const router = express.Router();

router.get('/price', getMarketPrice); 

module.exports = router;