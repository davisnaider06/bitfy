import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileEdit.css';

function ProfileEdit() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
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
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setName(data.name);
          setEmail(data.email);
          setWhatsappNumber(data.whatsappNumber || '');
        } else {
          throw new Error(data.message || 'Erro ao carregar dados do perfil.');
        }
      } catch (err) {
        console.error('Erro ao buscar perfil:', err);
        setError(err.message || 'Falha ao carregar dados do usuário.');
        if (err.message.includes('autenticado')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        }
      }
    };
    fetchUserProfile();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const updatedData = { name, email, whatsappNumber };
      if (password) {
        updatedData.password = password;
      }

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        // Atualizar os dados do usuário no localStorage
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            localStorage.setItem('user', JSON.stringify({ ...storedUser, name: data.name, email: data.email, whatsappNumber: data.whatsappNumber }));
        }
        //Limpa os campos de senha após sucesso
        setPassword('');
        setConfirmPassword('');
      } else {
        throw new Error(data.message || 'Erro ao atualizar perfil.');
      }
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      setError(err.message || 'Falha ao atualizar o perfil.');
    }
  };

  return (
    <div className="profile-edit-container">
      <h2>Editar Perfil</h2>
      <form onSubmit={handleSubmit} className="profile-edit-form">
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

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
          <label htmlFor="whatsappNumber">WhatsApp (com DDD e código do país):</label>
          <input
            type="text"
            id="whatsappNumber"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="Ex: 5511999999999"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Nova Senha (opcional):</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Deixe em branco para não alterar"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar Nova Senha:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button type="submit">Atualizar Perfil</button>
      </form>
    </div>
  );
}

export default ProfileEdit;