// src/components/Menu.js
import React from 'react';
// 1. IMPORTĂM Outlet AICI
import { Link, Outlet } from 'react-router-dom';
import './styles/Menu.css';

const Menu = () => {
    return (
        <> {/* Folosim un fragment sau un div container principal */}

            {/* PARTEA 1: BARĂ DE NAVIGARE (Rămâne fixă) */}
            <nav className="navbar">
                <div className="logo">Politie Admin</div>

                <div className="menu-items">
                    <Link to="/" style={{color: 'white', textDecoration: 'none'}}>Home</Link>

                    <div className="dropdown">
                        <button className="dropbtn">Gestiune Date ▼</button>
                        <div className="dropdown-content">
                            <Link to="/politisti">Lista Polițiști</Link>
                            <Link to="/persoane">Lista Persoane</Link>
                            <Link to="/incidente">Registru Incidente</Link>
                            <Link to="/amenzi">Registru Amenzi</Link>
                            <Link to="/adrese">Lista Adrese</Link>
                        </div>
                    </div>

                    <Link to="/statistici" style={{color: 'white', textDecoration: 'none'}}>Statistici</Link>
                </div>

                <button className="logout-btn" onClick={() => console.log("Logout logic here")}>Logout</button>
            </nav>

            {/* PARTEA 2: CONȚINUTUL PAGINII (Aici apare tabelul!) */}
            <div className="content-container" style={{ padding: '20px' }}>
                <Outlet />
            </div>

        </>
    );
};

export default Menu;