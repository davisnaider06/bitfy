import React, { useState, useEffect } from 'react';
import './Market.css';

function Market() {
    // Estados para armazenar os dados das criptomoedas, status de carregamento e erros
    const [cryptos, setCryptos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    //useEffect para buscar os dados das criptomoedas quando o componente for montado
    useEffect(() => {
        const fetchCryptos = async () => {
            try {
                setLoading(true);
                setError(null); 

                const response = await fetch('http://localhost:3001/api/crypto/list');

                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                // Atualiza o estado das criptos
                setCryptos(data);
            } catch (err) {
                console.error("Erro ao buscar criptomoedas:", err);
                setError("Não foi possível carregar as criptomoedas. Tente novamente mais tarde.");
            } finally {
                setLoading(false);
            }
        };
        fetchCryptos();
    }, []);

    if (loading) {
        return <div className="market-container loading">Carregando criptomoedas...</div>;
    }

    if (error) {
        return <div className="market-container error-message">{error}</div>;
    }

    // Renderiza a tabela de criptomoedas se não houver erro e os dados forem carregados
    return (
        <div className="market-container">
            <h1>Mercado de Criptomoedas</h1>
            <p>Preços em tempo real fornecidos pela CoinGecko.</p>
            <div className="crypto-table-container">
                <table className="crypto-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Moeda</th>
                            <th>Preço (USD)</th>
                            <th>Volume (24h)</th>
                            <th>Cap. de Mercado</th>
                            <th>Variação (24h)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cryptos.map((crypto, index) => (
                            <tr key={crypto.id}>
                                <td>{index + 1}</td>
                                <td className="crypto-name-cell">
                                    <img src={crypto.image} alt={crypto.name} className="crypto-icon" />
                                    {crypto.name} <span className="crypto-symbol">{crypto.symbol.toUpperCase()}</span>
                                </td>
                                <td>${crypto.current_price.toLocaleString()}</td>
                                <td>${crypto.total_volume.toLocaleString()}</td>
                                <td>${crypto.market_cap.toLocaleString()}</td>
                                <td className={crypto.price_change_percentage_24h >= 0 ? 'positive-change' : 'negative-change'}>
                                    {crypto.price_change_percentage_24h ? crypto.price_change_percentage_24h.toFixed(2) : '0.00'}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Market;