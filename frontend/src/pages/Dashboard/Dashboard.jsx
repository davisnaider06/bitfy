import React, { useState, useEffect } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";

function Dashboard() {
 const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeAlerts, setActiveAlerts] = useState([]); 
  const [assetPrices, setAssetPrices] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      console.log("Token no localStorage:", token);

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch("/api/users/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        console.log("Resposta da API:", data);

        if (!response.ok) {
          throw new Error(data.message || "Erro ao carregar perfil");
        }

        if (data && data.name && data.email) {
          setUser(data);
        } else {
          throw new Error("Usuário não encontrado na resposta da API");
        }
      } catch (err) {
        console.error("Erro:", err.message);
        setError(err.message);
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  useEffect(() => {
    const fetchActiveAlerts = async () => {
      const token = localStorage.getItem('token');
      if (!token || !user) return; //Só busca se tiver token e usuário carregado

      try {
        const response = await fetch('/api/alerts/active', {
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
    fetchActiveAlerts();
  }, [user]); //Depende do objeto user

  //Função para buscar precos dos ativos
  useEffect(() => {
    const fetchAssetPrices = async () => {
      if (activeAlerts.length === 0) {
        setAssetPrices({}); //Limpa os preços se não houver alertas
        return;
      }

      //Extrair símbolos únicos dos alertas ativos
      const uniqueSymbols = [...new Set(activeAlerts.map(alert => alert.assetSymbol))];
      const symbolsQuery = uniqueSymbols.join(','); //Ex BTCUSDT,ETHUSDT

      try {
        const response = await fetch(`/api/market/price?symbol=${symbolsQuery}`);
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

    //Chama a função imediatamente e depois a cada 10s
    fetchAssetPrices();
    const intervalId = setInterval(fetchAssetPrices, 10000); //Atualiza a cada 10s

    //Limpa o intervalo quando o componente é desmontado ou activeAlerts muda
    return () => clearInterval(intervalId);
  }, [activeAlerts]); //Depende dos alertas ativos


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        Carregando dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "red" }}>
        Erro: {error}
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/register" replace />;
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Bem-vindo ao Dashboard, {user.name}!</h1>
      <p>Email: {user.email}</p>
      {user.whatsappNumber && <p>WhatsApp: {user.whatsappNumber}</p>}
      <p>Você está logado. Aqui virá o painel de investimentos.</p>

      <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <h2>Preços dos Ativos Monitorados</h2>
        {Object.keys(assetPrices).length === 0 ? (
          <p>Nenhum preço disponível. Crie um alerta para monitorar um ativo.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {Object.entries(assetPrices).map(([symbol, price]) => (
              <li key={symbol} style={{ marginBottom: '10px', fontSize: '1.1em' }}>
                <strong>{symbol}:</strong> R$ {price ? price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 8 }) : 'N/A'}
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link to="/alerts" style={{
        display: 'inline-block',
        marginTop: '20px',
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '5px',
        fontSize: '16px',
        marginRight: '10px'
      }}>
        Gerenciar Alertas
      </Link>

      <Link to="/profile" style={{
        display: 'inline-block',
        marginTop: '20px',
        padding: '10px 20px',
        backgroundColor: '#6c757d', /* Cinza */
        color: 'white',
        textDecoration: 'none',
        borderRadius: '5px',
        fontSize: '16px',
        marginRight: '10px'
      }}>
        Editar Perfil
      </Link>

      <button onClick={handleLogout} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
        Sair
      </button>
    </div>
  );
}

export default Dashboard;