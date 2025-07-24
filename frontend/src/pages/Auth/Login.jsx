import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext'; 
import '../../components/AuthForm/Auth.css'; 

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/esconder senha

    const navigate = useNavigate();
    const { login } = useAuth(); // Use o hook useAuth para acessar a função login do contexto

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const response = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                // Chama a função login do contexto, passando o token e os dados do usuário
                // Certifique-se de que seu backend retorna `data.user` e `data.token`
                login(data.token, data.user);
                alert('Login bem-sucedido!');
                navigate('/market'); // Redireciona para a página de mercado ou dashboard após o login
            } else {
                setError(data.message || 'Erro no login.');
            }
        } catch (err) {
            console.error('Erro no login:', err);
            setError('Erro no login: ' + err.message);
        }
    };

    // Função para alternar a visibilidade da senha
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="auth-form-container">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Login</h2>
                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}

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
                <div className="form-group password-group"> {/* Adicionada a classe password-group */}
                    <label htmlFor="password">Senha:</label>
                    <input
                        type={showPassword ? 'text' : 'password'} // Tipo dinâmico baseado no estado
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {/* Ícone para alternar a visibilidade da senha */}
                    <span className="password-toggle-icon" onClick={togglePasswordVisibility}>
                        {showPassword ? (
                            // Ícone de olho aberto (exemplo SVG)
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-eye"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        ) : (
                            // Ícone de olho fechado (exemplo SVG)
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-eye-off"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                        )}
                    </span>
                </div>
                <button type="submit">Entrar</button>
                <p>
                    Não tem uma conta? <Link to="/register">Cadastre-se</Link>
                </p>
                <p>
                    <Link to="/forgot-password">Esqueceu a senha?</Link>
                </p>
            </form>
        </div>
    );
}

export default Login;