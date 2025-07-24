import React, { useState } from 'react';
import './Auth.css'; 

const EyeOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.173.267C13.58 9.332 11.82 10.5 8 10.5S4.12 9.332 2.832 8.233A13 13 0 0 1 1.172 8z"/>
    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
  </svg>
);


const EyeClosedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
    <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.38-4.38L2.91 5.207A8.002 8.002 0 0 0 1.181 8C1.173 8 4.12 9.332 5.88 10.5c.914.647 1.989 1.129 3.163 1.348zm-4.3-.614C4.562 10.359 3.35 9.4 2.832 8.233A13 13 0 0 1 1.172 8l.158.265C2.158 9.306 3.333 10.246 4.622 11.026zm4.777-4.109-.54-1.62A3.5 3.5 0 0 0 8 5.5c-.792 0-1.446.323-1.926.791l1.179 1.179zm-.686 5.133L9.217 14.82c.241.086.485.163.731.229 1.0.276 2.072.378 3.174.378.92 0 1.77-.105 2.57-.291l.158.265h-.001ZM10 12.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0m-2-3.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/>
    <path d="M15.293 2.905a1 1 0 0 1 1.414 1.414l-1.353 1.354L13.846 6.1l-1.354-1.354 1.414-1.414 1.354 1.354zm-12.022 9.589-.707-.707L2.175 10.01l.707.707.707.707L3.65 12.3Z"/>
    <path d="M.646 13.646 13.646.646a.5.5 0 0 1 .708.708L1.354 14.354a.5.5 0 0 1-.708-.708"/>
  </svg>
);


function AuthForm({ title, onSubmit, username, setUsername, email, setEmail, password, setPassword, whatsappNumber, setWhatsappNumber, isRegister = false, message, error, children }) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-form-container">
      <h2>{title}</h2>
      <form onSubmit={onSubmit} className="auth-form">
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        {isRegister && ( //só para registro
          <div className="form-group">
            <label htmlFor="username">Nome:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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

        <div className="form-group password-group">
          <label htmlFor="password">Senha:</label>
          <input
            type={showPassword ? 'text' : 'password'} //Alterna entre text e password
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span className="password-toggle-icon" onClick={togglePasswordVisibility}>
            {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />} {/* Ícone muda conforme clica nele */}
          </span>
        </div>

        {isRegister && ( //só para registro
          <div className="form-group">
            <label htmlFor="whatsappNumber">Número (Whatsapp):</label>
            <input
              type="text"
              id="whatsappNumber"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="Ex: 5511999999999"
              required
            />
          </div>
        )}

        <button type="submit">{title}</button>
        {children} {/* Para links adicionais tipo "ja tem uma conta?" */}
      </form>
    </div>
  );
}

export default AuthForm;