import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './styles/Menu.css';

const Menu = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            <nav className="navbar">
                <div className="logo">
                    <span>🛡️</span> ADMINISTRAȚIE POLIȚIE
                </div>

                {/* Afișez meniul DOAR dacă userul este logat */}
                {user && (
                    <>
                        <div className="menu-items">
                            <Link to="/acasa" className="nav-link">Acasă</Link>

                            <div className="dropdown">
                                {/* Am simplificat numele aici */}
                                <button className="dropbtn">Gestiune ▼</button>
                                <div className="dropdown-content">
                                    {/* Am simplificat numele și aici */}
                                    <Link to="/politisti">👮 Personal</Link>
                                    <Link to="/persoane">👥 Cetățeni</Link>
                                    <Link to="/incidente">🚨 Incidente</Link>
                                    <Link to="/amenzi">📝 Amenzi</Link>
                                    <Link to="/adrese">📍 Adrese</Link>
                                </div>
                            </div>

                            <Link to="/statistici" className="nav-link">Statistici</Link>
                        </div>

                        <button className="logout-btn" onClick={handleLogout}>
                            Deconectare
                        </button>
                    </>
                )}
            </nav>

            <div className="content-container">
                <Outlet />
            </div>
        </>
    );
};

export default Menu;