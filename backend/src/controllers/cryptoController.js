const { getCryptoList, getCryptoChartData } = require('../services/cryptoService');

// @desc    Obter lista de criptomoedas
// @route   GET /api/crypto/list
// @access  Public (por enquanto, pode ser protegido depois)
const getCoinsList = async (req, res) => {
    try {
        const cryptos = await getCryptoList();
        res.status(200).json(cryptos);
    } catch (error) {
        console.error('Erro no controller getCoinsList:', error.message);
        res.status(500).json({ message: error.message || 'Erro ao obter lista de criptomoedas.' });
    }
};

// @desc    Obter dados de gráfico para uma criptomoeda específica
// @route   GET /api/crypto/:id/chart
// @access  Public (por enquanto)
const getCoinChart = async (req, res) => {
    const { id } = req.params; //ID da criptomoeda
    const { days, vs_currency } = req.query; // Parâmetros de query para dias e moeda

    try {
        const chartData = await getCryptoChartData(id, days, vs_currency);
        res.status(200).json(chartData);
    } catch (error) {
        console.error(`Erro no controller getCoinChart para ${id}:`, error.message);
        res.status(500).json({ message: error.message || `Erro ao obter dados de gráfico para ${id}.` });
    }
};

module.exports = {
    getCoinsList,
    getCoinChart,
};