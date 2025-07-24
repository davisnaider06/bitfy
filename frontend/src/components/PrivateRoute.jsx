import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  const token = localStorage.getItem('token'); // Pega o token do localStorage

  // Se o token existe, o usuário está autenticado, então renderiza as rotas filhas
  // Se não, redireciona para a página de login
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;