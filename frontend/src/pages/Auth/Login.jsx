import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthForm from "../../components/AuthForm/AuthForm";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user)); // Armazena info do usuário
        setMessage("Login bem-sucedido! Redirecionando...");
        navigate("/dashboard"); //Redir pro dashboard
      } else {
        throw new Error(data.message || "Erro no login.");
      }
    } catch (err) {
      console.error("Erro no login:", err);
      setError(err.message || "Falha ao fazer login.");
    }
  };

  return (
    <AuthForm
      title="Login"
      onSubmit={handleSubmit}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      message={message}
      error={error}
      isRegister={false}
    >
      <p>
        Não tem uma conta? <Link to="/register">Crie Conta</Link>
      </p>
      
      <p>
        Esqueceu a senha? <Link to="/forgot-password">Redefinir Senha</Link>
      </p>
    </AuthForm>
  );
}

export default Login;