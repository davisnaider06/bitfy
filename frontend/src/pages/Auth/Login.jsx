import { useNavigate, Link } from 'react-router-dom';
import AuthForm from "../../components/AuthForm/AuthForm.jsx";

function Login() {
  const navigate = useNavigate();

  const handleLogin = async (formData) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao fazer login. Verifique suas credenciais.');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('Login bem-sucedido:', data);
      navigate('/dashboard'); 
    } catch (error) {
      console.error('Erro no handleLogin:', error);
      throw error;
    }
  };

  return (
    <div className="login-page">
      <AuthForm type="login" onSubmit={handleLogin} />
      <div className="auth-links">
        Não tem uma conta? <Link to="/register">Crie uma aqui</Link>
      </div>
    </div>
  );
}

export default Login;
