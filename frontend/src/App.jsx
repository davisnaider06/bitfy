import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

//Importações dos componentes de Autenticação
import Register from './pages/Auth/Register';
import Login from './pages/Auth/login'; 
import ForgotPassword from './pages/Auth/forgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

import PrivateRoute from './components/PrivateRoute';

// Importações dos componentes de Funcionalidade
import Dashboard from './pages/Dashboard/Dashboard';
import AlertManager from './pages/Alerts/AlertManager';
import ProfileEdit from './pages/Profile/ProfileEdit'; // Importado

import './App.css'; 

function App() {
  return (
    <Router>
      <Routes>
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/alerts" element={<AlertManager />} />
          <Route path="/profile" element={<ProfileEdit />} />
          
        </Route>

      
        <Route path="/" element={<Navigate to="/login" replace />} />

        
      </Routes>
    </Router>
  );
}

export default App;