import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext'; 
import './Trade.css'; 

function Trade() {
    const { user } = useAuth(); //Para ter acesso ao usuário (se necessário para saldo, etc.)
    const [selectedCrypto, setSelectedCrypto] = useState(''); // Estado para a cripto selecionada
    const [amount, setAmount] = useState(''); // Estado para a quantidade
    const [tradeType, setTradeType] = useState('buy'); //buy ou sell
    const [currentPrice, setCurrentPrice] = useState(null); //Preço atual do ativo selecionado
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [availableCryptos, setAvailableCryptos] = useState([]); 

    useEffect(() => {
        const fetchCryptos = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/market/all-cryptos'); 
                const data = await response.json();
                if (response.ok) {
                    setAvailableCryptos(data.map(crypto => ({
                        symbol: crypto.symbol,
                        name: crypto.name,
                        icon: crypto.icon // Se o seu backend retornar o ícone
                    })));
                } else {
                    throw new Error(data.message || 'Erro ao carregar criptomoedas.');
                }
            } catch (err) {
                console.error('Erro ao buscar criptomoedas:', err);
                setError('Não foi possível carregar as criptomoedas disponíveis.');
            }
        };
        fetchCryptos();
    }, []);


    // Effect para buscar o preço atual da criptomoeda selecionada
    useEffect(() => {
        if (selectedCrypto) {
            const fetchCurrentPrice = async () => {
                try {
                    const response = await fetch(`http://localhost:3001/api/market/price?symbol=${selectedCrypto}`);
                    const data = await response.json();
                    if (response.ok && data[selectedCrypto]) {
                        setCurrentPrice(parseFloat(data[selectedCrypto]));
                    } else {
                        setCurrentPrice(null); // Limpa o preço se não encontrar
                        throw new Error(data.message || 'Preço não encontrado.');
                    }
                } catch (err) {
                    console.error('Erro ao buscar preço:', err);
                    setCurrentPrice(null);
                    setError('Não foi possível obter o preço atual para ' + selectedCrypto);
                }
            };
            fetchCurrentPrice();
            const intervalId = setInterval(fetchCurrentPrice, 5000); // Atualiza a cada 5 segundos
            return () => clearInterval(intervalId); // Limpa o intervalo
        } else {
            setCurrentPrice(null); // Limpa o preço se nenhuma cripto estiver selecionada
        }
    }, [selectedCrypto]); // Depende da criptomoeda selecionada

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        if (!selectedCrypto || !amount || parseFloat(amount) <= 0) {
            setError('Por favor, selecione uma criptomoeda e insira uma quantidade válida.');
            setLoading(false);
            return;
        }

        const token = localStorage.getItem('token'); //Ou use user.token se armazenado no contexto
        if (!token) {
            setError('Você precisa estar logado para realizar transações.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/transactions/trade', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    assetSymbol: selectedCrypto,
                    amount: parseFloat(amount),
                    type: tradeType, // 'buy' ou 'sell'
                    priceAtExecution: currentPrice
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || `${tradeType === 'buy' ? 'Compra' : 'Venda'} realizada com sucesso!`);
                setAmount(''); //Limpa o campo
                //Atualizar saldo do usuário no contexto ou redirecionar
            } else {
                throw new Error(data.message || `Erro ao ${tradeType === 'buy' ? 'comprar' : 'vender'} ativo.`);
            }
        } catch (err) {
            console.error('Erro na transação:', err);
            setError(err.message || 'Ocorreu um erro na transação. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const estimatedValue = currentPrice ? (parseFloat(amount) * currentPrice) : 0;

    return (
        <div className="trade-container">
            <h1>Comprar / Vender Ativos</h1>
            <p className="trade-subtitle">Realize suas operações de compra e venda de criptomoedas.</p>

            <div className="trade-toggle">
                <button
                    className={`toggle-button ${tradeType === 'buy' ? 'active' : ''}`}
                    onClick={() => setTradeType('buy')}
                >
                    Comprar
                </button>
                <button
                    className={`toggle-button ${tradeType === 'sell' ? 'active' : ''}`}
                    onClick={() => setTradeType('sell')}
                >
                    Vender
                </button>
            </div>

            <form className="trade-form" onSubmit={handleSubmit}>
                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}

                <div className="form-group">
                    <label htmlFor="crypto-select">Criptomoeda:</label>
                    <select
                        id="crypto-select"
                        value={selectedCrypto}
                        onChange={(e) => setSelectedCrypto(e.target.value)}
                        required
                    >
                        <option value="">Selecione um ativo</option>
                        {availableCryptos.map(crypto => (
                            <option key={crypto.symbol} value={crypto.symbol}>
                                {crypto.name} ({crypto.symbol})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="amount">Quantidade:</label>
                    <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        step="any"
                        min="0"
                        required
                    />
                </div>

                <div className="current-price-info">
                    {selectedCrypto && currentPrice !== null ? (
                        <p>
                            Preço Atual de {selectedCrypto}:
                            <span className="price-display"> R$ {currentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</span>
                        </p>
                    ) : (
                        selectedCrypto && <p className="price-loading">Buscando preço...</p>
                    )}
                    {selectedCrypto && currentPrice === null && !loading && !error && (
                        <p className="price-unavailable">Preço indisponível para {selectedCrypto}.</p>
                    )}
                </div>

                <div className="estimated-value-info">
                    <p>
                        Valor Estimado ({tradeType === 'buy' ? 'Gasto' : 'Recebido'}):
                        <span className="estimated-value-display"> R$ {estimatedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </p>
                </div>

                <button type="submit" className="trade-button" disabled={loading || !selectedCrypto || !amount || parseFloat(amount) <= 0}>
                    {loading ? 'Processando...' : (tradeType === 'buy' ? 'Comprar' : 'Vender')}
                </button>
            </form>

            
        </div>
    );
}

export default Trade;