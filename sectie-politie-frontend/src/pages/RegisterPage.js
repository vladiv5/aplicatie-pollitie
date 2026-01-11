/** Pagina de Activare Cont (Register)
 * Permite politistilor existenti in baza de date sa isi creeze user/parola
 * @author Ivan Vlad-Daniel
 * @version 11 ianuarie 2026
 */
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import '../components/styles/Login.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        nume: '', prenume: '', telefon: '',
        newUsername: '', newPassword: '', confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Sterg eroarea cand utilizatorul incepe sa scrie
        if (errors[name]) setErrors({ ...errors, [name]: '' });
    };

    const handleClear = (fieldName) => {
        setFormData({ ...formData, [fieldName]: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            // Trimit cererea de activare catre backend
            await register(formData);
            toast.success("Cont activat cu succes!");
            navigate('/login');
        } catch (err) {
            // Afisez erorile specifice venite de la server
            if (err.response && err.response.data) {
                setErrors(err.response.data);
            }
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (label, name, placeholder, type = "text", icon) => (
        <div className="form-group">
            <label><i className={`fa-solid ${icon}`}></i> {label}</label>
            <div className="input-wrapper">
                <input
                    type={type}
                    name={name}
                    className={`login-input ${errors[name] ? 'input-error' : ''}`}
                    placeholder={placeholder}
                    value={formData[name]}
                    onChange={handleChange}
                />
                {formData[name] && (
                    <button type="button" className="search-clear-btn-gold" onClick={() => handleClear(name)}>
                        <i className="fa-solid fa-circle-xmark"></i>
                    </button>
                )}
            </div>
            {errors[name] && <span className="field-error">{errors[name]}</span>}
        </div>
    );

    return (
        <div className="login-container">
            <div className="login-card" style={{ maxWidth: '500px' }}>
                <div className="login-header">
                    <i className="fa-solid fa-id-card logo-icon"></i>
                    <h2>Activare Cont</h2>
                    <p>Revendică-ți identitatea în sistem</p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <p className="register-step-title">Pasul 1: Identificare</p>
                    {renderInput("Nume", "nume", "Popescu", "text", "fa-user-tie")}
                    {renderInput("Prenume", "prenume", "Andrei", "text", "fa-user")}
                    {renderInput("Telefon Serviciu", "telefon", "07...", "text", "fa-phone")}

                    <p className="register-step-title" style={{marginTop:'20px'}}>Pasul 2: Securitate</p>
                    {renderInput("Username Nou", "newUsername", "utilizator123", "text", "fa-at")}

                    <div className="form-group">
                        <div className="form-label-group">
                            <label><i className="fa-solid fa-key"></i> Parolă</label>
                            <button type="button" className="btn-toggle-pass" onClick={() => setShowPass(!showPass)}>
                                <i className={`fa-solid ${showPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                        <div className="input-wrapper">
                            <input
                                type={showPass ? "text" : "password"}
                                name="newPassword"
                                className={`login-input ${errors.newPassword ? 'input-error' : ''}`}
                                value={formData.newPassword}
                                onChange={handleChange}
                            />
                            {formData.newPassword && (
                                <button type="button" className="search-clear-btn-gold" onClick={() => handleClear("newPassword")}>
                                    <i className="fa-solid fa-circle-xmark"></i>
                                </button>
                            )}
                        </div>
                        {errors.newPassword && <span className="field-error">{errors.newPassword}</span>}
                    </div>

                    {renderInput("Confirmă Parola", "confirmPassword", "••••••••", showPass ? "text" : "password", "fa-check-double")}

                    <button type="submit" className="login-btn" disabled={loading} style={{marginTop:'30px'}}>
                        {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'ACTIVEAZĂ CONTUL'}
                    </button>
                </form>

                <div style={{textAlign: 'center', marginTop: '20px'}}>
                    <span onClick={() => navigate('/login')} className="auth-link">
                        <i className="fa-solid fa-arrow-left"></i> Înapoi la Autentificare
                    </span>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;