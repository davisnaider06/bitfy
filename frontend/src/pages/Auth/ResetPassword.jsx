import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './AuthPages.css'; 

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { token } = useParams(); // Pega o token da url
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword: password }), 
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Senha redefinida com sucesso! Redirecionando para o login...');
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          navigate('/login'); //Redireciona para o login dps da redefinição
        }, 3000); // Redireciona dps de 3 segundos
      } else {
        throw new Error(data.message || 'Erro ao redefinir a senha.');
      }
    } catch (err) {
      console.error('Erro ao redefinir senha:', err);
      setError(err.message || 'Falha ao redefinir sua senha. O link pode ser inválido ou ter expirado.');
    }
  };

  return (
    <div className="auth-form-container"> {/* Reutiliza o estilo do AuthForm */}
      <h2>Redefinir Senha</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        <div className="form-group">
          <label htmlFor="password">Nova Senha:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirme a Nova Senha:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">Redefinir Senha</button>

        <p>
          <Link to="/login">Voltar ao Login</Link>
        </p>
      </form>
    </div>
  );
}

export default ResetPassword;