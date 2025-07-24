import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // Apenas Routes, Route, Navigate

//Importações dos componentes de Autenticação
import Register from './pages/Auth/Register';
import Login from './pages/Auth/login';
import ForgotPassword from './pages/Auth/forgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

import PrivateRoute from './components/PrivateRoute';

// Importações dos componentes de Funcionalidade
import Dashboard from './pages/Dashboard/Dashboard';
import AlertManager from './pages/Alerts/AlertManager';
import ProfileEdit from './pages/Profile/ProfileEdit';
import Market from './pages/Market/Market';
import Navbar from './components/Navbar/Navbar';
import Trade from './pages/Trade/Trade'
import './App.css';

function App() {
  return (
    
    <> 
      <Navbar/>
      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

       
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/alerts" element={<AlertManager />} />
          <Route path="/profile" element={<ProfileEdit />} />
          <Route path="/market" element={<Market />} />
          <Route path="/trade" element={<Trade />} />
        </Route>

        {/* Redirecionamento padrão para login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Rota para página não encontrada */}
        <Route path="*" element={<div>Página Não Encontrada</div>} />
      </Routes>
    </>
  );
}

export default App;