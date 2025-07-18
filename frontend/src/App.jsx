import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';


import Register from './pages/Auth/Register';
import Login from './pages/Auth/login';


import Dashboard from './pages/Dashboard/Dashboard'; // Importa o Dashboard do novo local


import AlertManager from './pages/Alerts/AlertManager';

import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rota pro registro */}
        <Route path="/register" element={<Register />} />

        {/* Rota pro login */}
        <Route path="/login" element={<Login />} />

        {/* Rota pro Dashboard (protegida via pela logica interna do Dashboard.jsx) */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Rota para o Gerenciador de Alertas (protegida pela logica interna do AlertManager.jsx) */}
        <Route path="/alerts" element={<AlertManager />} />

        {/* Rota padrão que redireciona para o login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;