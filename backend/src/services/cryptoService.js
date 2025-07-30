const axios = require('axios');

const COINGECKO_API_BASE_URL = 'https://api.coingecko.com/api/v3';

// Variáveis para o cache
let cryptoListCache = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 60 * 1000; // 60 segundos de cache (ajuste conforme necessário)

// Função para buscar uma lista de criptomoedas com seus preços atuais
const getCryptoList = async () => {
    // Verifica se o cache é válido
    if (cryptoListCache && (Date.now() - lastFetchTime < CACHE_DURATION_MS)) {
        console.log('Retornando lista de criptomoedas do cache.');
        return cryptoListCache;
    }

    try {
        console.log('Buscando nova lista de criptomoedas da CoinGecko...');
        const response = await axios.get(`${COINGECKO_API_BASE_URL}/coins/markets`, {
            params: {
                vs_currency: 'usd', // Moeda de comparação
                order: 'market_cap_desc', // Ordenar por capitalização de mercado
                per_page: 16, // Número de criptomoedas por página
                page: 1, // Página 1
                sparkline: false, // Não incluir dados de sparkline nos resultados iniciais
            },
        });

        // Atualiza o cache e o timestamp
        cryptoListCache = response.data;
        lastFetchTime = Date.now();
        console.log('Lista de criptomoedas atualizada e armazenada em cache.');
        return cryptoListCache;

    } catch (error) {
        console.error('Erro ao buscar lista de criptomoedas da CoinGecko:', error.message);
        // Se houver um erro e já houver dados em cache, retorne os dados antigos para resiliência
        if (cryptoListCache) {
            console.warn('Erro ao buscar novos dados, retornando dados antigos do cache.');
            return cryptoListCache;
        }
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
