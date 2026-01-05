import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import '../components/styles/Home.css';
import toast from 'react-hot-toast';

const HomePage = () => {
    const { user } = useAuth();
    const [time, setTime] = useState(new Date());

    // Efect pentru ceasul live
    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Formatare data si ora
    const formatTime = (date) => {
        return date.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    // Daca userul e null (desi ProtectedRoute previne asta), afisam loading
    if (!user) return <div>Se încarcă profilul...</div>;

    return (
        <div className="home-container">

            {/* Banner Superior */}
            <div className="welcome-banner">
                <div className="welcome-text">
                    <h1>Bine ați venit, {user.nume} {user.prenume}!</h1>
                    <p>Panou de Control Operativ - Secția Centrală</p>
                </div>
                <div className="live-clock">
                    <span className="clock-time">{formatTime(time)}</span>
                    <span className="clock-date">{formatDate(time)}</span>
                </div>
            </div>

            <div className="dashboard-grid">

                {/* COLOANA STANGA: Card Identitate */}
                <div className="left-column">
                    <div className="id-card-wrapper">
                        <div className="id-card-header">
                            <div className="officer-avatar">👮‍♂️</div>
                            <h2 className="officer-name">{user.nume} {user.prenume}</h2>
                            <span className="officer-rank">{user.grad || 'Ofițer'}</span>
                        </div>
                        <div className="id-card-body">
                            <div className="id-detail-row">
                                <span className="label">ID Legitimație:</span>
                                <span className="value">#{user.idPolitist || '0000'}</span>
                            </div>
                            <div className="id-detail-row">
                                <span className="label">Funcție:</span>
                                <span className="value">{user.functie || 'Nedefinit'}</span>
                            </div>
                            <div className="id-detail-row">
                                <span className="label">Telefon:</span>
                                <span className="value">{user.telefon_serviciu || '-'}</span>
                            </div>
                            <div className="id-detail-row">
                                <span className="label">Status Cont:</span>
                                <span className="value" style={{color: 'green'}}>ACTIV</span>
                            </div>
                        </div>
                    </div>

                    <div className="system-status">
                        <div className="status-dot"></div>
                        Sistem Conectat la Baza de Date Națională
                    </div>
                </div>

                {/* COLOANA DREAPTA: Scurtaturi */}
                <div className="right-column">
                    <h3 style={{color:'#444', marginTop:0}}>Acces Rapid Module</h3>
                    <div className="shortcuts-grid">

                        <Link to="/incidente" className="shortcut-card">
                            <span className="shortcut-icon">🚨</span>
                            <span className="shortcut-title">Registru Incidente</span>
                            <span className="shortcut-desc">Adăugați sau vizualizați incidente</span>
                        </Link>

                        <Link to="/amenzi" className="shortcut-card">
                            <span className="shortcut-icon">📝</span>
                            <span className="shortcut-title">Gestiune Amenzi</span>
                            <span className="shortcut-desc">Verificați plăți și sancțiuni</span>
                        </Link>

                        <Link to="/persoane" className="shortcut-card">
                            <span className="shortcut-icon">👥</span>
                            <span className="shortcut-title">Bază Date Persoane</span>
                            <span className="shortcut-desc">Căutați persoane</span>
                        </Link>

                        <Link to="/statistici" className="shortcut-card">
                            <span className="shortcut-icon">📊</span>
                            <span className="shortcut-title">Rapoarte & Analiză</span>
                            <span className="shortcut-desc">Vizualizați performanța secției</span>
                        </Link>

                        <Link to="/politisti" className="shortcut-card">
                            <span className="shortcut-icon">👮</span>
                            <span className="shortcut-title">Colegi</span>
                            <span className="shortcut-desc">Lista personalului</span>
                        </Link>

                        <Link to="/adrese" className="shortcut-card">
                            <span className="shortcut-icon">📍</span>
                            <span className="shortcut-title">Hartă Adrese</span>
                            <span className="shortcut-desc">Zone de risc și domicilii cetățeni</span>
                        </Link>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default HomePage;