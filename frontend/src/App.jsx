// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Auth/Register';
import Login from './pages/Auth/login';
import './App.css'; 

function Dashboard() {
  // Exemplo de como pegar o token e usuário do localStorage
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  if (!token || !user) {
    return <Navigate to="/login" replace />; 
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; 
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Bem-vindo ao Dashboard, {user.name}!</h1>
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

export default App;