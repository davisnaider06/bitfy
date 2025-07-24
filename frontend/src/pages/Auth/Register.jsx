import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthForm from "../../components/AuthForm/AuthForm"; 

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await fetch("http://localhost:3001/api/auth/register", { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password, whatsappNumber }), 
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Registro bem-sucedido!");
        setUsername("");
        setEmail("");
        setPassword("");
        setWhatsappNumber(""); // Limpa o campo de WhatsApp após o registro
        // navigate('/dashboard');
      } else {
        throw new Error(data.message || "Erro no registro.");
      }
    } catch (err) {
      console.error("Erro no registro:", err);
      setError(err.message || "Falha ao registrar.");
    }
  };

  return (
    <AuthForm
      title="Criar Conta"
      onSubmit={handleSubmit}
      username={username}
      setUsername={setUsername}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      whatsappNumber={whatsappNumber} // Passa o estado do WhatsApp para o AuthForm
      setWhatsappNumber={setWhatsappNumber} // Passa o setter do WhatsApp para o AuthForm
      message={message}
      error={error}
      isRegister={true} 
    >
      <p>
        Já tem uma conta? <Link to="/login">Faça Login</Link>
      </p>
    </AuthForm>
  );
}

export default Register;