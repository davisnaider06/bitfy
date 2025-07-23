const axios = require('axios');

// @desc    Obter preço atual de um ativo ou de múltiplos ativos
// @route   GET /api/market/price?symbol=BTCUSDT,ETHUSDT
// @access  Public (ou Private se preferir proteger)
const getMarketPrice = async (req, res) => {
    const { symbol } = req.query; //Recebe 'symbol' como um parâmetro de query
    if (!symbol) {
        return res.status(400).json({ message: 'Símbolo do ativo é obrigatório.' });
    }

    const symbolsArray = symbol.split(','); 

    try {
        const prices = {};
        for (const s of symbolsArray) {
            const response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${s.toUpperCase()}`);
            prices[s.toUpperCase()] = parseFloat(response.data.price);
        }
        res.json(prices);
    } catch (error) {
        console.error(`Erro ao buscar preço para ${symbol}:`, error.message);
        res.status(500).json({ message: `Erro ao buscar preço para ${symbol}.` });
    }
};

module.exports = { getMarketPrice };