// frontend/src/pages/TradePage/TradePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import './TradePage.css'; // Importa o CSS para esta página

function TradePage() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    // Estados para dados da carteira e transações
    const [BRLBalance, setBRLBalance] = useState(0);
    const [assets, setAssets] = useState({});
    const [transactions, setTransactions] = useState([]);
    const [assetPrices, setAssetPrices] = useState({}); // Para preços de mercado ao vivo

    // Estados para formulários
    const [depositAmount, setDepositAmount] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [buyAssetSymbol, setBuyAssetSymbol] = useState('');
    const [buyBRLAmount, setBuyBRLAmount] = useState('');
    const [sellAssetSymbol, setSellAssetSymbol] = useState('');
    const [sellAssetAmount, setSellAssetAmount] = useState('');

    // Estados para feedback do usuário
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    // --- Funções de Fetch de Dados ---

    // Busca o saldo da carteira e ativos do usuário
    const fetchWalletData = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        try {
            const response = await fetch('http://localhost:3001/api/wallet/balance', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) {
                setBRLBalance(data.BRLBalance);
                setAssets(data.assets);
            } else {
                throw new Error(data.message || 'Erro ao carregar dados da carteira.');
            }
        } catch (err) {
            console.error('Erro ao buscar dados da carteira:', err);
            setError(err.message || 'Falha ao carregar dados da carteira.');
            if (err.message.includes('autenticado')) {
                logout();
            }
        }
    };

    // Busca o histórico de transações do usuário
    const fetchTransactions = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const response = await fetch('http://localhost:3001/api/wallet/transactions', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) {
                setTransactions(data.transactions);
            } else {
                throw new Error(data.message || 'Erro ao carregar transações.');
            }
        } catch (err) {
            console.error('Erro ao buscar transações:', err);
            setError(err.message || 'Falha ao carregar transações.');
        }
    };

    // Busca preços de ativos para compra/venda
    const fetchAssetPrices = async (symbols) => {
        if (symbols.length === 0) return;
        const symbolsQuery = symbols.join(',');
        try {
            const response = await fetch(`http://localhost:3001/api/market/price?symbol=${symbolsQuery}`);
            const data = await response.json();
            if (response.ok) {
                setAssetPrices(prevPrices => ({ ...prevPrices, ...data }));
            } else {
                throw new Error(data.message || 'Erro ao buscar preços dos ativos.');
            }
        } catch (err) {
            console.error('Erro ao buscar preços de mercado:', err);
        }
    };

    // --- Efeitos de Carregamento Inicial ---

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        setLoading(true);
        fetchWalletData();
        fetchTransactions();
        setLoading(false);
    }, [isAuthenticated, navigate]);

    // Efeito para buscar preços dos ativos que o usuário possui na carteira
    useEffect(() => {
        const ownedAssetSymbols = Object.keys(assets).filter(symbol => assets[symbol] > 0);
        if (ownedAssetSymbols.length > 0) {
            fetchAssetPrices(ownedAssetSymbols);
            const intervalId = setInterval(() => fetchAssetPrices(ownedAssetSymbols), 15000); // Atualiza a cada 15s
            return () => clearInterval(intervalId);
        }
    }, [assets]); // Depende do estado 'assets'

    // --- Funções de Manipulação de Formulários ---

    const handleOperation = async (operationType, payload) => {
        setMessage('');
        setError('');
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/wallet/${operationType}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                // Atualiza os dados da carteira e transações após a operação
                fetchWalletData();
                fetchTransactions();
                // Limpa os campos do formulário
                setDepositAmount('');
                setWithdrawAmount('');
                setBuyAssetSymbol('');
                setBuyBRLAmount('');
                setSellAssetSymbol('');
                setSellAssetAmount('');
            } else {
                throw new Error(data.message || `Erro ao processar ${operationType}.`);
            }
        } catch (err) {
            console.error(`Erro na operação de ${operationType}:`, err);
            setError(err.message || `Falha ao processar ${operationType}.`);
        }
    };

    // Handlers específicos para cada operação
    const handleDeposit = (e) => {
        e.preventDefault();
        handleOperation('deposit', { amount: parseFloat(depositAmount) });
    };

    const handleWithdraw = (e) => {
        e.preventDefault();
        handleOperation('withdraw', { amount: parseFloat(withdrawAmount) });
    };

    const handleBuy = (e) => {
        e.preventDefault();
        handleOperation('buy', { assetSymbol: buyAssetSymbol.toUpperCase(), BRLAmount: parseFloat(buyBRLAmount) });
    };

    const handleSell = (e) => {
        e.preventDefault();
        handleOperation('sell', { assetSymbol: sellAssetSymbol.toUpperCase(), assetAmount: parseFloat(sellAssetAmount) });
    };

    // --- Renderização ---

    if (loading) {
        return <div className="trade-container loading">Carregando página de Trade...</div>;
    }

    if (error && !message) { // Exibe erro se houver e não houver mensagem de sucesso
        return (
            <div className="trade-container">
                <p className="error-message">Erro: {error}. Por favor, tente novamente.</p>
                <button onClick={logout} className="action-button" style={{ marginTop: '1rem' }}>
                    Voltar ao Login
                </button>
            </div>
        );
    }

    // Função auxiliar para formatar valores em BRL
    const formatBRL = (value) => {
        return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // Função auxiliar para formatar quantidades de ativos cripto
    const formatCryptoAmount = (value) => {
        return parseFloat(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 8 });
    };

    return (
        <div className="trade-container">
            <h1>Sua Carteira e Operações</h1>
            <p className="trade-subtitle">Gerencie seus fundos e ativos cripto.</p>

            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}

            {/* Resumo da Carteira */}
            <section className="trade-section wallet-summary">
                <h2>Saldo da Carteira</h2>
                <div className="balance-display">
                    <p><strong>Saldo em BRL:</strong> {formatBRL(BRLBalance)}</p>
                    <h3>Seus Ativos Cripto:</h3>
                    {Object.keys(assets).length === 0 || Object.values(assets).every(amount => parseFloat(amount) === 0) ? (
                        <p>Você não possui ativos cripto.</p>
                    ) : (
                        <ul className="asset-list">
                            {Object.entries(assets).map(([symbol, amount]) => parseFloat(amount) > 0 && (
                                <li key={symbol}>
                                    <strong>{symbol}:</strong> {formatCryptoAmount(amount)}
                                    {assetPrices[symbol] && (
                                        <span className="current-price-info">
                                            {' '} (Valor Atual: {formatBRL(parseFloat(amount) * assetPrices[symbol])} @ {formatBRL(assetPrices[symbol])})
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>

            {/* Seção de Operações (Depósito/Saque/Compra/Venda) */}
            <section className="trade-section operations">
                <h2>Operações</h2>
                <div className="operations-grid">
                    {/* Formulário de Depósito */}
                    <div className="operation-card deposit">
                        <h3>Depositar BRL</h3>
                        <form onSubmit={handleDeposit}>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="Valor em BRL"
                                value={depositAmount}
                                onChange={(e) => setDepositAmount(e.target.value)}
                                required
                            />
                            <button type="submit">Depositar</button>
                        </form>
                    </div>

                    {/* Formulário de Saque */}
                    <div className="operation-card withdraw">
                        <h3>Sacar BRL</h3>
                        <form onSubmit={handleWithdraw}>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="Valor em BRL"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                required
                            />
                            <button type="submit">Sacar</button>
                        </form>
                    </div>

                    {/* Formulário de Compra */}
                    <div className="operation-card buy">
                        <h3>Comprar Cripto</h3>
                        <form onSubmit={handleBuy}>
                            <input
                                type="text"
                                placeholder="Símbolo do Ativo (Ex: BTCUSDT)"
                                value={buyAssetSymbol}
                                onChange={(e) => setBuyAssetSymbol(e.target.value.toUpperCase())}
                                required
                            />
                            <input
                                type="number"
                                step="0.01"
                                placeholder="Valor em BRL"
                                value={buyBRLAmount}
                                onChange={(e) => setBuyBRLAmount(e.target.value)}
                                required
                            />
                            <button type="submit">Comprar</button>
                        </form>
                    </div>

                    {/* Formulário de Venda */}
                    <div className="operation-card sell">
                        <h3>Vender Cripto</h3>
                        <form onSubmit={handleSell}>
                            <input
                                type="text"
                                placeholder="Símbolo do Ativo (Ex: BTCUSDT)"
                                value={sellAssetSymbol}
                                onChange={(e) => setSellAssetSymbol(e.target.value.toUpperCase())}
                                required
                            />
                            <input
                                type="number"
                                step="0.00000001" // Alta precisão para cripto
                                placeholder="Quantidade do Ativo"
                                value={sellAssetAmount}
                                onChange={(e) => setSellAssetAmount(e.target.value)}
                                required
                            />
                            <button type="submit">Vender</button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Histórico de Transações */}
            <section className="trade-section transaction-history">
                <h2>Histórico de Transações</h2>
                {transactions.length === 0 ? (
                    <p>Nenhuma transação registrada ainda.</p>
                ) : (
                    <ul className="transaction-list">
                        {transactions.map(tx => (
                            <li key={tx.id} className={`transaction-item ${tx.type.toLowerCase()}`}>
                                <strong>Tipo:</strong> {tx.type} <br />
                                <strong>Ativo:</strong> {tx.assetSymbol} <br />
                                <strong>Quantidade:</strong> {formatCryptoAmount(tx.amount)} <br />
                                <strong>Valor BRL:</strong> {formatBRL(tx.BRLAmount)} <br />
                                {tx.price && <strong>Preço Unitário:</strong>} {tx.price && formatBRL(tx.price)} <br />
                                <strong>Data:</strong> {new Date(tx.createdAt).toLocaleString('pt-BR')} <br />
                                <strong>Status:</strong> {tx.status}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <div style={{ marginTop: '20px' }}>
                <Link to="/dashboard" className="back-to-dashboard-btn">Voltar ao Dashboard</Link>
            </div>
        </div>
    );
}

export default TradePage;
