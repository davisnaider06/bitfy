// frontend/src/components/Navbar/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Assegure-se de que o caminho está correto
import './Navbar.css';

function Navbar() {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false); // Estado para controlar se o menu mobile está aberto

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Função para alternar o estado do menu (abrir/fechar)
    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    // Função para fechar o menu mobile ao clicar em um link
    // Isso é importante para que o menu se feche automaticamente após a navegação
    const closeMenu = () => {
        setIsOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <Link to="/" onClick={closeMenu}>Bitfy</Link> {/* Fecha o menu se o logo for clicado */}
            </div>

            {/* Ícone do Menu Hambúrguer */}
            {/* A classe 'open' é adicionada condicionalmente para animar o ícone */}
            <div className={`hamburger-menu ${isOpen ? 'open' : ''}`} onClick={toggleMenu}>
                <span></span>
                <span></span>
                <span></span>
            </div>

            {/* Links da Navegação */}
            {/* A classe 'open' é adicionada condicionalmente para mostrar/esconder o menu mobile */}
            <ul className={`navbar-links ${isOpen ? 'open' : ''}`}>
                <li><Link to="/dashboard" onClick={closeMenu}>Dashboard</Link></li>
                <li><Link to="/market" onClick={closeMenu}>Mercado</Link></li>
                <li><Link to="/trade" onClick={closeMenu}>Trade</Link></li>
                <li><Link to="/alerts" onClick={closeMenu}>Alertas</Link></li>
                <li><Link to="/profile" onClick={closeMenu}>Perfil</Link></li>
                {isAuthenticated ? (
                    <li><button onClick={handleLogout} className="logout-button">Sair</button></li>
                ) : (
                    <>
                        <li><Link to="/login" onClick={closeMenu}>Login</Link></li>
                        <li><Link to="/register" onClick={closeMenu}>Registrar</Link></li>
                    </>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;