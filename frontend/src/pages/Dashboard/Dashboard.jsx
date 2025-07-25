// frontend/src/pages/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from '../../Context/AuthContext'; 
import './Dashboard.css'; 

function Dashboard() {
    const { user, isAuthenticated, logout, setUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeAlerts, setActiveAlerts] = useState([]);
    const [assetPrices, setAssetPrices] = useState({});
    const navigate = useNavigate();

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

                if (data && data.username && data.email) {
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
             setLoading(false); //Ja tem usuário e está autenticado
        }

    }, [isAuthenticated, user, navigate, setUser, logout]);

    useEffect(() => {
        const fetchActiveAlerts = async () => {
            const token = localStorage.getItem('token'); 
            if (!token || !user) return;

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

    
    useEffect(() => {
        const fetchAssetPrices = async () => {
            if (activeAlerts.length === 0) {
                setAssetPrices({}); 
                return;
            }

            // Extrair símbolos únicos dos alertas ativos
            const uniqueSymbols = [...new Set(activeAlerts.map(alert => alert.assetSymbol))];
            const symbolsQuery = uniqueSymbols.join(','); // Ex BTCUSDT,ETHUSDT

            try {
                const response = await fetch(`http://localhost:3001/api/market/price?symbol=${symbolsQuery}`);
                const data = await response.json();
                if (response.ok) {
                    setAssetPrices(data);
                } else {
                    throw new Error(data.message || 'Erro ao buscar preços dos ativos.');
                }
            } catch (err) {
                console.error('Erro ao buscar preços de mercado:', err);
            }
        };

        // Chama a função imediatamente e depois a cada 10s
        fetchAssetPrices();
        const intervalId = setInterval(fetchAssetPrices, 10000);

        return () => clearInterval(intervalId);
    }, [activeAlerts]); 

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
                <button onClick={logout} className="action-button sell-button" style={{marginTop: '1rem'}}>
                    Voltar ao Login
                </button>
            </div>
        );
    }

    // Se não estiver autenticado e o carregamento terminou, redireciona.
    // O PrivateRoute já deveria fazer isso, mas é uma segurança extra.
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="dashboard-container">
            <h1>Bem-vindo ao Dashboard, {user?.username || user?.name || 'Usuário'}!</h1> {/* Acessa user?.username ou user?.name */}
            <p className="dashboard-subtitle">Visão geral dos seus ativos e atividades.</p>

            <section className="dashboard-section portfolio-summary">
                <h2>Saldo da Carteira</h2>
                {/* Aqui vai ser exibido o saldo real da carteira do usuário */}
                <div className="portfolio-value">
                    <span>Saldo Total Estimado:</span>
                    <span className="value-display">R$ 0,00</span> {/* Valor dinâmico */}
                </div>
                <div className="portfolio-change">
                    <span>Variação 24h:</span>
                    <span className="change-display positive-change">+0.00%</span> {/* Variação dinâmica */}
                </div>
            </section>

            <section className="dashboard-section your-assets">
                <h2>Seus Alertas Ativos</h2>
                {activeAlerts.length === 0 ? (
                    <div className="no-assets-message">
                        Você ainda não tem alertas ativos. <Link to="/alerts">Crie um agora!</Link>
                    </div>
                ) : (
                    <ul className="alerts-list">
                        {activeAlerts.map(alert => (
                            <li key={alert._id} className="alert-item">
                                <strong>{alert.assetSymbol}</strong>: Preço Alvo: R$ {alert.targetPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({alert.condition === 'above' ? 'Acima' : 'Abaixo'})
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

            <section className="dashboard-section quick-actions">
                <h2>Ações Rápidas</h2>
                <div className="actions-grid">
                    {/* Estes botões ainda não têm funcionalidade, apenas estilo */}
                    <Link to="/trade" className="action-button buy-button">Comprar Cripto</Link> {/* Link para a futura página de Trade */}
                    <Link to="/trade" className="action-button sell-button">Vender Cripto</Link> {/* Link para a futura página de Trade */}
                    <button className="action-button deposit-button">Depositar</button>
                    <button className="action-button withdraw-button">Sacar</button>
                </div>
            </section>
        </div>
    );
}

export default Dashboard;