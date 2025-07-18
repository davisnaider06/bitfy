import React from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Para redirecionar e linkar
import AuthForm from '../../components/AuthForm/AuthForm';

function Register() {
  const navigate = useNavigate();

  const handleRegister = async (formData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        
        throw new Error(data.message || 'Erro ao registrar usuário.');
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user)); // Salva dados do usuário
      console.log('Registro bem-sucedido:', data);
      navigate('/dashboard');

    } catch (error) {
      console.error('Erro no handleRegister:', error);
      throw error;
    }
  };

  return (
    <div className="register-page">
      <AuthForm type="register" onSubmit={handleRegister} />
      <div className="auth-links">
        Já tem uma conta? <Link to="/login">Faça Login</Link>
      </div>
    </div>
  );
}

export default Register;