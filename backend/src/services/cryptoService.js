const axios = require('axios');

const COINGECKO_API_BASE_URL = 'https://api.coingecko.com/api/v3';

// Função para buscar uma lista de criptomoedas com seus preços atuais
const getCryptoList = async () => {
    try {
        const response = await axios.get(`${COINGECKO_API_BASE_URL}/coins/markets`, {
            params: {
                vs_currency: 'usd', // Moeda de comparação
                order: 'market_cap_desc', //Ordenar por capitalização de mercado
                per_page: 16, //Número de criptomoedas por página
                page: 1, //Página 1
                sparkline: false, // Não incluir dados de sparkline nos resultados iniciais
            },
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar lista de criptomoedas da CoinGecko:', error.message);
        throw new Error('Não foi possível obter dados de criptomoedas no momento.');
    }
};

// Função para buscar dados históricos de uma criptomoeda específica para gráficos
const getCryptoChartData = async (coinId, days = 7, vs_currency = 'usd') => {
    try {
        const response = await axios.get(`${COINGECKO_API_BASE_URL}/coins/${coinId}/market_chart`, {
            params: {
                vs_currency: vs_currency,
                days: days, // Número de dias para os dados históricos (ex: 1, 7, 30, 365, max)
            },
        });
        return response.data; // Inclui prices, market_caps, total_volumes
    } catch (error) {
        console.error(`Erro ao buscar dados históricos para ${coinId} da CoinGecko:`, error.message);
        throw new Error(`Não foi possível obter dados de gráfico para ${coinId} no momento.`);
    }
};

module.exports = {
    getCryptoList,
    getCryptoChartData,
};