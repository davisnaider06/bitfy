// frontend/src/pages/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from '../../Context/AuthContext';
import './Dashboard.css';

function Dashboard() {
    const { user, isAuthenticated, logout, setUser } = useAuth();
    console.log("Objeto user no Dashboard:", user);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeAlerts, setActiveAlerts] = useState([]);
    const [assetPrices, setAssetPrices] = useState({});
    const [walletBRLBalance, setWalletBRLBalance] = useState(0); // NOVO ESTADO PARA O SALDO DA CARTEIRA
    const navigate = useNavigate();

    // Efeito para buscar o perfil do usuário ao carregar ou autenticar
    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch("http://localhost:3001/api/users/profile", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();
                console.log("Resposta da API de Perfil:", data);

                if (!response.ok) {
                    throw new Error(data.message || "Erro ao carregar perfil");
                }

                if (data && data.id && data.email) {
                    setUser(data);
                } else {
                    throw new Error("Dados do usuário incompletos na resposta da API");
                }
            } catch (err) {
                console.error("Erro ao carregar perfil:", err.message);
                setError(err.message);
                logout();
            } finally {
                setLoading(false);
            }
        };

        if (!user && isAuthenticated) {
            fetchUserProfile();
        } else if (!isAuthenticated) {
            setLoading(false);
            navigate("/login");
        } else {
            setLoading(false);
        }

    }, [isAuthenticated, user, navigate, setUser, logout]);

    // Efeito para buscar alertas ativos do usuário
    useEffect(() => {
        const fetchActiveAlerts = async () => {
            const token = localStorage.getItem('token');
            if (!token || !user) {
                return;
            }

            try {
                const response = await fetch('http://localhost:3001/api/alerts/active', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                if (response.ok) {
                    setActiveAlerts(data);
                } else {
                    throw new Error(data.message || 'Erro ao carregar alertas.');
                }
            } catch (err) {
                console.error('Erro ao buscar alertas ativos:', err);
            }
        };

        if (user) {
            fetchActiveAlerts();
        }
    }, [user]);

    // NOVO EFEITO: Para buscar o saldo da carteira (BRL)
    // Isso garante que o saldo exibido no dashboard seja o saldo real da carteira
    useEffect(() => {
        const fetchWalletBRLBalance = async () => {
            const token = localStorage.getItem('token');
            if (!token || !user) {
                return;
            }
            try {
                // Requisição para a nova rota de saldo da carteira
                const response = await fetch('http://localhost:3001/api/wallet/balance', {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                const data = await response.json();
                if (response.ok) {
                    setWalletBRLBalance(data.BRLBalance); // Atualiza o estado com o saldo BRL da carteira
                } else {
                    throw new Error(data.message || 'Erro ao carregar saldo da carteira.');
                }
            } catch (err) {
                console.error('Erro ao buscar saldo da carteira para o dashboard:', err);
                // Não define erro global para não bloquear o dashboard inteiro se apenas o saldo falhar
            }
        };

        if (user) { // Busca o saldo da carteira quando o usuário está carregado
            fetchWalletBRLBalance();
            // Opcional: Atualizar o saldo da carteira periodicamente no dashboard
            const intervalId = setInterval(fetchWalletBRLBalance, 30000); // A cada 30 segundos
            return () => clearInterval(intervalId);
        }
    }, [user]); // Dependência: busca saldo quando o objeto 'user' é carregado/alterado

    // Efeito para buscar preços de ativos monitorados (a cada 10 segundos)
    useEffect(() => {
        const fetchAssetPrices = async () => {
            if (activeAlerts.length === 0) {
                setAssetPrices({});
                return;
            }

            const uniqueSymbols = [...new Set(activeAlerts.map(alert => alert.assetSymbol))];
            const symbolsQuery = uniqueSymbols.join(',');

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

        fetchAssetPrices();
        const intervalId = setInterval(fetchAssetPrices, 10000);

        return () => clearInterval(intervalId);
    }, [activeAlerts]);

    // Renderização condicional baseada nos estados de carregamento e erro
    if (loading) {
        return (
            <div className="dashboard-container loading">
                Carregando dashboard...
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-container">
                <p className="error-message">Erro: {error}. Por favor, tente novamente.</p>
                <button onClick={logout} className="action-button sell-button" style={{ marginTop: '1rem' }}>
                    Voltar ao Login
                </button>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Função auxiliar para formatar valores em BRL
    const formatBRL = (value) => {
        return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div className="dashboard-container">
            {/* CORREÇÃO 1: Exibir o nome do usuário.
                Assume que o objeto 'user' do contexto de autenticação tem uma propriedade 'name' ou 'username'.
                Prioriza 'name', depois 'username', e usa 'Usuário' como fallback. */}
            <h1>Bem-vindo ao Dashboard, {user?.name || user?.username || 'Usuário'}!</h1>
            <p className="dashboard-subtitle">Visão geral dos seus ativos e atividades.</p>

            {/* Seção de Saldo da Carteira */}
            <section className="dashboard-section portfolio-summary">
                <h2>Saldo da Carteira</h2>
                <div className="portfolio-value">
                    <span>Saldo Total Estimado:</span>
                    {/* CORREÇÃO 2: Exibir o saldo da carteira (walletBRLBalance)
                        Este valor é buscado do backend via /api/wallet/balance e reflete o saldo da Wallet.BRL. */}
                    <span className="value-display">
                        {formatBRL(walletBRLBalance)}
                    </span>
                </div>
                <div className="portfolio-change">
                    <span>Variação 24h:</span>
                    <span className="change-display positive-change">+0.00%</span>
                </div>
            </section>

            {/* Seção de Alertas Ativos */}
            <section className="dashboard-section your-assets">
                <h2>Seus Alertas Ativos</h2>
                {activeAlerts.length === 0 ? (
                    <div className="no-assets-message">
                        Você ainda não tem alertas ativos. <Link to="/alerts">Crie um agora!</Link>
                    </div>
                ) : (
                    <ul className="alerts-list">
                        {activeAlerts.map(alert => (
                            <li key={alert.id} className="alert-item">
                                <strong>{alert.assetSymbol}</strong>: Preço Alvo: R$ {alert.triggerPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({alert.alertType === 'ABOVE' ? 'Acima' : 'Abaixo'})
                                {assetPrices[alert.assetSymbol] && (
                                    <span className="current-price-display">
                                        (Atual: R$ {assetPrices[alert.assetSymbol].toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 8 })})
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* Seção de Preços de Ativos Monitorados */}
            <section className="dashboard-section recent-activity">
                <h2>Preços de Ativos Monitorados</h2>
                {Object.keys(assetPrices).length === 0 ? (
                    <div className="no-activity-message">
                        Nenhum preço disponível. Crie um alerta para monitorar um ativo.
                    </div>
                ) : (
                    <ul className="prices-list">
                        {Object.entries(assetPrices).map(([symbol, price]) => (
                            <li key={symbol} className="price-item">
                                <strong>{symbol}:</strong> R$ {price ? price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 8 }) : 'N/A'}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* Seção de Ações Rápidas */}
            <section className="dashboard-section quick-actions">
                <h2>Ações Rápidas</h2>
                <div className="actions-grid">
                    <Link to="/trade" className="action-button buy-button">Comprar Cripto</Link>
                    <Link to="/trade" className="action-button sell-button">Vender Cripto</Link>
                    <button className="action-button deposit-button">Depositar</button>
                    <button className="action-button withdraw-button">Sacar</button>
                </div>
            </section>
        </div>
    );
}

export default Dashboard;
