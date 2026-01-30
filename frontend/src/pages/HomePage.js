/** Dashboard-ul principal (Panou Operativ)
 * Afiseaza ceasul, ID-ul ofiterului si scurtaturi catre module
 * @author Ivan Vlad-Daniel
 * @version 11 ianuarie 2026
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import '../components/styles/Home.css';
import Modal from '../components/Modal';
import MyActivityModal from '../components/MyActivityModal';

const HomePage = () => {
    const { user } = useAuth();
    const [time, setTime] = useState(new Date());
    const [isActivityOpen, setIsActivityOpen] = useState(false);

    // Actualizez ceasul in timp real
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (!user) return <div className="loading-container"><div className="spinner"></div></div>;

    return (
        <div className="home-container">

            {/* Header: Mesaj de bun venit si Ceas */}
            <div className="welcome-banner">
                <div className="welcome-text">
                    <h1>Panou Operativ</h1>
                    <p>Bine ați venit, {user.nume} {user.prenume}</p>
                </div>
                <div className="live-clock">
                    <span className="clock-time">{time.toLocaleTimeString('ro-RO', {hour:'2-digit', minute:'2-digit'})}</span>
                    <span className="clock-date">{time.toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* ID Card Virtual (Stanga) */}
                <div className="left-column">
                    <div className="id-card-wrapper">
                        <div className="id-card-header">
                            <div className="officer-avatar-container">
                                <i className="fa-solid fa-user-shield officer-avatar-icon"></i>
                            </div>
                            <h2 className="officer-name">{user.nume} {user.prenume}</h2>
                            <span className="officer-rank">{user.grad || 'Ofițer'}</span>
                        </div>

                        <div className="id-card-body">
                            <div className="id-detail-row">
                                <span className="label">ID Legitimație</span>
                                <span className="value">#{user.idPolitist}</span>
                            </div>
                            <div className="id-detail-row">
                                <span className="label">Unitate</span>
                                <span className="value">Secția Centrală</span>
                            </div>
                            <div className="id-detail-row">
                                <span className="label">Status</span>
                                <span className="status-badge">ACTIV</span>
                            </div>
                        </div>

                        <div className="system-status-mini">
                            <div className="status-dot"></div> Conexiune Securizată
                        </div>
                    </div>
                </div>

                {/* Grid Scurtaturi (Dreapta) */}
                <div className="right-column">
                    <h3>Module Operative</h3>
                    <div className="shortcuts-grid">
                        <Link to="/incidente" className="shortcut-card">
                            <i className="shortcut-icon fa-solid fa-car-burst"></i>
                            <div className="shortcut-content">
                                <span className="shortcut-title">Incidente</span>
                                <span className="shortcut-desc">Registru intervenții și sesizări</span>
                            </div>
                        </Link>

                        <Link to="/amenzi" className="shortcut-card">
                            <i className="shortcut-icon fa-solid fa-file-invoice-dollar"></i>
                            <div className="shortcut-content">
                                <span className="shortcut-title">Amenzi</span>
                                <span className="shortcut-desc">Sancțiuni și procese verbale</span>
                            </div>
                        </Link>

                        <Link to="/persoane" className="shortcut-card">
                            <i className="shortcut-icon fa-solid fa-users"></i>
                            <div className="shortcut-content">
                                <span className="shortcut-title">Persoane</span>
                                <span className="shortcut-desc">Evidența populației</span>
                            </div>
                        </Link>

                        <Link to="/adrese" className="shortcut-card">
                            <i className="shortcut-icon fa-solid fa-map-location-dot"></i>
                            <div className="shortcut-content">
                                <span className="shortcut-title">Hărți & Adrese</span>
                                <span className="shortcut-desc">Localizare și zone de risc</span>
                            </div>
                        </Link>

                        <Link to="/statistici" className="shortcut-card">
                            <i className="shortcut-icon fa-solid fa-chart-line"></i>
                            <div className="shortcut-content">
                                <span className="shortcut-title">Rapoarte</span>
                                <span className="shortcut-desc">Analiză performanță</span>
                            </div>
                        </Link>

                        <Link to="/politisti" className="shortcut-card">
                            <i className="shortcut-icon fa-solid fa-user-group"></i>
                            <div className="shortcut-content">
                                <span className="shortcut-title">Personal</span>
                                <span className="shortcut-desc">Gestiune efective</span>
                            </div>
                        </Link>

                        {/* Buton special pentru Dosarul Meu */}
                        <div className="shortcut-card" onClick={() => setIsActivityOpen(true)} style={{ cursor: 'pointer' }}>
                            <i className="shortcut-icon fa-solid fa-folder-open"></i>
                            <div className="shortcut-content">
                                <span className="shortcut-title">Dosarul Meu</span>
                                <span className="shortcut-desc">Activitate și istoric personal</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Dosar Personal */}
            <Modal isOpen={isActivityOpen} onClose={() => setIsActivityOpen(false)} title={`Dosar: ${user.nume} ${user.prenume}`} maxWidth="900px">
                <MyActivityModal userId={user.idPolitist} onClose={() => setIsActivityOpen(false)} />
            </Modal>
        </div>
    );
};

export default HomePage;