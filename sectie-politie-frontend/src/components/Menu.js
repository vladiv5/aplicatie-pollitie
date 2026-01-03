import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Importam contextul
import './styles/Menu.css';

const Menu = () => {
    const { user, logout } = useAuth(); // Luam userul si functia logout
    const navigate = useNavigate();

    const handleLogout = () => {
        logout(); // Sterge token/user din state si localStorage
        navigate('/login'); // Trimite la pagina de login
    };

    return (
        <>
            <nav className="navbar">
                <div className="logo">
                    <span>🛡️</span> ADMINISTRAȚIE POLIȚIE
                </div>

                {/* Afisam meniul DOAR daca userul este logat */}
                {user && (
                    <>
                        <div className="menu-items">
                            <Link to="/acasa" className="nav-link">Acasă</Link>

                            <div className="dropdown">
                                <button className="dropbtn">Gestiune Operativă ▼</button>
                                <div className="dropdown-content">
                                    <Link to="/politisti">👮 Personal (Polițiști)</Link>
                                    <Link to="/persoane">👥 Cetățeni (Persoane)</Link>
                                    <Link to="/incidente">🚨 Registru Incidente</Link>
                                    <Link to="/amenzi">📝 Registru Amenzi</Link>
                                    <Link to="/adrese">📍 Nomenclator Adrese</Link>
                                </div>
                            </div>

                            <Link to="/statistici" className="nav-link">📊 Statistici & Rapoarte</Link>
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