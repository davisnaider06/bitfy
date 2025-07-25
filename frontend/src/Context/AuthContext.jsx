// frontend/src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null); // Para armazenar dados do usuário, se necessário
    const navigate = useNavigate();

    useEffect(() => {
        // Verifica o token no localStorage ao carregar a aplicação
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user'); // Se você estiver armazenando os dados do usuário
        if (storedToken) {
            setToken(storedToken);
            setIsAuthenticated(true);
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Erro ao fazer parse dos dados do usuário do localStorage", e);
                setUser(null);
            }
        }
    }, []);

    const login = (newToken, userData) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData)); // Salva os dados do usuário
        setToken(newToken);
        setIsAuthenticated(true);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setIsAuthenticated(false);
        setUser(null);
        navigate('/login'); // Redireciona para login após o logout
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, token, user, login, logout, setIsAuthenticated, setToken, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook customizado para usar o contexto de autenticação
export const useAuth = () => {
    return useContext(AuthContext);
};