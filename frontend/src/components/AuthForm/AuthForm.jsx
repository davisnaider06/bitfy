
import React, { useState } from 'react';
import './AuthForm.css';
function AuthForm({ type, onSubmit }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = { email, password };
      if (type === 'register') {
        formData.name = name;
        formData.whatsappNumber = whatsappNumber;
      }

      await onSubmit(formData);
    } catch (err) {
      setError(err.message || 'Ocorreu um erro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>{type === 'register' ? 'Criar Conta' : 'Entrar'}</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        {type === 'register' && (
          <div className="form-group">
            <label htmlFor="name">Nome:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        )}
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Senha:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {type === 'register' && (
          <div className="form-group">
            <label htmlFor="whatsappNumber">Número:</label>
            <input
              type="text"
              id="whatsappNumber"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="Ex: 5511999999999"
            />
          </div>
        )}
        {error && <p className="error-message">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Carregando...' : (type === 'register' ? 'Registrar' : 'Login')}
        </button>
      </form>
    </div>
  );
}

export default AuthForm;