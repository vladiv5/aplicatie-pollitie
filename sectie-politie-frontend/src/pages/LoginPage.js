import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../components/styles/Login.css'; // Asigura-te ca calea e corecta

const LoginPage = () => {
    const [nume, setNume] = useState('');
    const [parola, setParola] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(nume, parola);
            // Redirectionare reusita
            navigate('/politisti');
        } catch (err) {
            setError('Credențiale invalide sau eroare de sistem.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <span className="police-badge">🛡️</span>
                    <h2>Sistem Gestiune</h2>
                    <p>Secția de Poliție - Acces Restricționat</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Utilizator</label>
                        <input
                            type="text"
                            className="login-input"
                            placeholder="Introduceți numele..."
                            value={nume}
                            onChange={(e) => setNume(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Parolă</label>
                        <input
                            type="password"
                            className="login-input"
                            placeholder="••••••••"
                            value={parola}
                            onChange={(e) => setParola(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Se autentifică...' : 'AUTENTIFICARE'}
                    </button>
                </form>

                {error && <div className="error-msg">⚠️ {error}</div>}

                <div className="login-footer">
                    &copy; 2025 Ministerul Afacerilor Interne. Toate drepturile rezervate.
                </div>
            </div>
        </div>
    );
};

export default LoginPage;