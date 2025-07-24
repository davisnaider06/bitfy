import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './AuthPages.css'; 
function ForgotPassword() {
  const [emailOrWhatsapp, setEmailOrWhatsapp] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/auth/forgot-password', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailOrWhatsapp }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Se o usuário for encontrado, um link de redefinição de senha será enviado.');
        setEmailOrWhatsapp('');
      } else {
        throw new Error(data.message || 'Erro ao solicitar redefinição de senha.');
      }
    } catch (err) {
      console.error('Erro ao solicitar redefinição:', err);
      setError(err.message || 'Falha ao processar sua solicitação.');
    }
  };

  return (
    <div className="auth-form-container"> {/* Reutiliza o estilo do AuthForm */}
      <h2>Redefinir Senha</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        <div className="form-group">
          <label htmlFor="emailOrWhatsapp">Email ou Número de WhatsApp:</label>
          <input
            type="text"
            id="emailOrWhatsapp"
            value={emailOrWhatsapp}
            onChange={(e) => setEmailOrWhatsapp(e.target.value)}
            placeholder="seu@email.com ou 5511999999999"
            required
          />
        </div>

        <button type="submit">Enviar Link de Redefinição</button>

        <p>
          <Link to="/login">Voltar ao Login</Link>
        </p>
      </form>
    </div>
  );
}

export default ForgotPassword;