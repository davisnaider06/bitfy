// frontend/src/App.jsx (apenas a função Dashboard)
import React, { useState, useEffect } from 'react'; // Importar useState e useEffect
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Register from './pages/Auth/Register';
import Login from './pages/Auth/login';

//Dashboard
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
          //se o token for invalido/expirado, o back retorna 401
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
        localStorage.removeItem('token'); //"limpa" o toke em caso de erro grave
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
    navigate('/login'); //redireciona para o login
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Carregando dashboard...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>Erro: {error}</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;//fallback
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Bem-vindo ao Dashboard, {user.name}!</h1>
      <p>Email: {user.email}</p>
      {user.whatsappNumber && <p>WhatsApp: {user.whatsappNumber}</p>}
      <p>Você está logado. Aqui virá o painel de investimentos.</p>
      <button onClick={handleLogout} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
        Sair
      </button>
    </div>
  );
}


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Redireciona a rota raiz para o login ou para o dashboard se já logado */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App