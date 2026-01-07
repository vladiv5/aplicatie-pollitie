import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import '../components/styles/Login.css';

const LoginPage = () => {
    const [nume, setNume] = useState('');
    const [parola, setParola] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        try {
            await login(nume, parola);
            toast.success("Acces permis. Bun venit!");
            navigate('/acasa');
        } catch (err) {
            // Eu preiau aici harta de erori trimisa de AuthController.java
            if (err.response && err.response.data) {
                setErrors(err.response.data);
            } else {
                setErrors({ global: "Server indisponibil." });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <i className="fa-solid fa-shield-halved logo-icon"></i>
                    <h2>Sistem Gestiune</h2>
                    <p>Secția de Poliție - Acces Restricționat</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label><i className="fa-solid fa-user"></i> Utilizator</label>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                className={`login-input ${errors.nume ? 'input-error' : ''}`}
                                placeholder="Nume utilizator..."
                                value={nume}
                                onChange={(e) => setNume(e.target.value)}
                            />
                            {nume && (
                                <button type="button" className="search-clear-btn-gold" onClick={() => setNume('')}>
                                    <i className="fa-solid fa-circle-xmark"></i>
                                </button>
                            )}
                        </div>
                        {errors.nume && <span className="field-error">{errors.nume}</span>}
                    </div>

                    <div className="form-group">
                        <div className="form-label-group">
                            <label><i className="fa-solid fa-lock"></i> Parolă</label>
                            <button type="button" className="btn-toggle-pass" onClick={() => setShowPass(!showPass)}>
                                <i className={`fa-solid ${showPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                        <div className="input-wrapper">
                            <input
                                type={showPass ? "text" : "password"}
                                className={`login-input ${errors.parola ? 'input-error' : ''}`}
                                placeholder="••••••••"
                                value={parola}
                                onChange={(e) => setParola(e.target.value)}
                            />
                            {parola && (
                                <button type="button" className="search-clear-btn-gold" onClick={() => setParola('')}>
                                    <i className="fa-solid fa-circle-xmark"></i>
                                </button>
                            )}
                        </div>
                        {errors.parola && <span className="field-error">{errors.parola}</span>}
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'AUTENTIFICARE'}
                    </button>
                </form>

                {errors.global && <div className="error-msg" style={{marginTop:'15px'}}>⚠️ {errors.global}</div>}

                <div style={{textAlign: 'center', marginTop: '20px'}}>
                    <span onClick={() => navigate('/register')} className="auth-link">
                        <i className="fa-solid fa-user-plus"></i> Activează-ți contul aici
                    </span>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;