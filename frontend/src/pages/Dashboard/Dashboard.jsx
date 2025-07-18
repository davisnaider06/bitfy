import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('/api/users/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
          }
          throw new Error(data.message || 'Erro ao carregar perfil.');
        }

        setUser(data.user);
      } catch (err) {
        console.error('Erro ao buscar perfil:', err);
        setError(err.message || 'Falha ao carregar os dados do usuário.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Carregando dashboard...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>Erro: {error}</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Bem-vindo ao Dashboard, {user.name}!</h1>
      <p>Email: {user.email}</p>
      {user.whatsappNumber && <p>WhatsApp: {user.whatsappNumber}</p>}
      <p>Você está logado. Aqui virá o painel de investimentos.</p>

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

      <button onClick={handleLogout} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
        Sair
      </button>
    </div>
  );
}

export default Dashboard;