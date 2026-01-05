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
            toast.success("Te-ai autentificat cu succes!");
            navigate('/acasa');
        } catch (err) {
            toast.error("Autentificare eșuată. Verifică datele.");

            if (err.response && err.response.data) {
                if (typeof err.response.data === 'object') {
                    setErrors(err.response.data);
                } else {
                    setErrors({ global: err.response.data });
                }
            } else {
                setErrors({ global: 'Eroare de conexiune la server.' });
            }
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
                            className={`login-input ${errors.nume ? 'input-error' : ''}`}
                            placeholder="Introduceți numele de utilizator..."
                            value={nume}
                            onChange={(e) => {
                                setNume(e.target.value);
                                if(errors.nume) setErrors({...errors, nume: ''});
                            }}
                        />
                        {errors.nume && <span className="field-error">{errors.nume}</span>}
                    </div>

                    <div className="form-group">
                        <div className="form-label-group">
                            <label>Parolă</label>
                            {/* BUTON STILIZAT */}
                            <button
                                type="button"
                                className="btn-toggle-pass"
                                onClick={() => setShowPass(!showPass)}
                            >
                                {showPass ? "Ascunde" : "Arată"}
                            </button>
                        </div>
                        <input
                            type={showPass ? "text" : "password"}
                            className={`login-input ${errors.parola ? 'input-error' : ''}`}
                            placeholder="••••••••"
                            value={parola}
                            onChange={(e) => {
                                setParola(e.target.value);
                                if(errors.parola) setErrors({...errors, parola: ''});
                            }}
                        />
                        {errors.parola && <span className="field-error">{errors.parola}</span>}
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Se autentifică...' : 'AUTENTIFICARE'}
                    </button>
                </form>

                {errors.global && <div className="error-msg" style={{marginTop:'10px'}}>⚠️ {errors.global}</div>}

                <div style={{textAlign: 'center', marginTop: '15px', fontSize: '14px'}}>
                    <p style={{color: '#666', marginBottom: '5px'}}>Ești polițist nou?</p>
                    <span onClick={() => navigate('/register')} style={{cursor: 'pointer', color: '#0056b3', fontWeight: 'bold'}}>
                        Activează-ți contul aici
                    </span>
                </div>

                <div className="login-footer">
                    &copy; 2025 Ministerul Afacerilor Interne. Toate drepturile rezervate.
                </div>
            </div>
        </div>
    );
};

export default LoginPage;