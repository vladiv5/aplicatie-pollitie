/**
 * Main navigation component (Navbar).
 * @author Ivan Vlad-Daniel
 * @version January 11, 2026
 */
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
                    <i className="fa-solid fa-shield-halved logo-icon"></i>
                    <span className="logo-text">POLICE <span style={{fontWeight:300}}>DB</span></span>
                </div>

                {user && (
                    <>
                        <div className="menu-items">
                            <Link to="/acasa" className="nav-link">
                                <i className="fa-solid fa-house"></i> Acasă
                            </Link>

                            <div className="dropdown">
                                <button className="dropbtn">
                                    <i className="fa-solid fa-layer-group"></i> Gestiune <i className="fa-solid fa-caret-down" style={{fontSize:'0.8em', marginLeft:'5px'}}></i>
                                </button>
                                <div className="dropdown-content">
                                    <Link to="/politisti"><i className="fa-solid fa-user-shield"></i> Personal</Link>
                                    <Link to="/persoane"><i className="fa-solid fa-users"></i> Cetățeni</Link>
                                    <Link to="/incidente"><i className="fa-solid fa-car-burst"></i> Incidente</Link>
                                    <Link to="/amenzi"><i className="fa-solid fa-file-invoice-dollar"></i> Amenzi</Link>
                                    <Link to="/adrese"><i className="fa-solid fa-map-location-dot"></i> Adrese</Link>
                                </div>
                            </div>

                            <Link to="/statistici" className="nav-link">
                                <i className="fa-solid fa-chart-pie"></i> Statistici
                            </Link>
                        </div>

                        <button className="logout-btn" onClick={handleLogout}>
                            <i className="fa-solid fa-right-from-bracket"></i> Ieșire
                        </button>
                    </>
                )}
            </nav>

            {/* I use Outlet as the placeholder for child routes content */}
            <div className="content-container">
                <Outlet />
            </div>
        </>
    );
};

export default Menu;