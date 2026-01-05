import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import '../components/styles/Login.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        nume: '',
        prenume: '',
        telefon: '',
        newUsername: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            await register(formData);
            toast.success("Cont activat! Te rugăm să te autentifici.");
            navigate('/login');
        } catch (err) {
            toast.error("Activare eșuată. Verifică câmpurile marcate cu roșu.");

            if (err.response && err.response.data) {
                if (typeof err.response.data === 'object') {
                    setErrors(err.response.data);
                    if (err.response.data.global) {
                        toast.error(err.response.data.global);
                    }
                } else {
                    toast.error(err.response.data);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            {/* Am mărit lățimea cardului puțin pentru a arăta mai bine */}
            <div className="login-card" style={{ maxWidth: '500px' }}>
                <div className="login-header">
                    <span className="police-badge">📝</span>
                    <h2>Activare Cont</h2>
                    <p>Revendică-ți contul de polițist</p>
                </div>

                <form onSubmit={handleSubmit} noValidate>

                    {/* PASUL 1: Date Personale */}
                    <div style={{borderBottom:'1px solid #eee', paddingBottom:'15px', marginBottom:'15px'}}>
                        <p style={{fontSize:'12px', color:'#666', marginBottom:'10px', textTransform:'uppercase', fontWeight:'bold', letterSpacing:'1px'}}>
                            Pasul 1: Identificare
                        </p>

                        <div className="form-group">
                            <label>Nume</label>
                            <input name="nume" placeholder="Ex: Popescu" className={`login-input ${errors.nume ? 'input-error' : ''}`} onChange={handleChange} />
                            {errors.nume && <span className="field-error">{errors.nume}</span>}
                        </div>

                        <div className="form-group">
                            <label>Prenume</label>
                            <input name="prenume" placeholder="Ex: Andrei" className={`login-input ${errors.prenume ? 'input-error' : ''}`} onChange={handleChange} />
                            {errors.prenume && <span className="field-error">{errors.prenume}</span>}
                        </div>

                        <div className="form-group">
                            <label>Telefon Serviciu</label>
                            <input name="telefon" placeholder="07..." className={`login-input ${errors.telefon ? 'input-error' : ''}`} onChange={handleChange} />
                            {errors.telefon && <span className="field-error">{errors.telefon}</span>}
                        </div>
                    </div>

                    {/* PASUL 2: Credențiale */}
                    <div>
                        <p style={{fontSize:'12px', color:'#666', marginBottom:'10px', textTransform:'uppercase', fontWeight:'bold', letterSpacing:'1px'}}>
                            Pasul 2: Securitate
                        </p>

                        <div className="form-group">
                            <label>Nume Utilizator Dorit</label>
                            <input name="newUsername" placeholder="Selectați username" className={`login-input ${errors.newUsername ? 'input-error' : ''}`} onChange={handleChange} />
                            {errors.newUsername && <span className="field-error">{errors.newUsername}</span>}
                        </div>

                        <div className="form-group">
                            <div className="form-label-group">
                                <label>Parolă Nouă</label>
                                {/* BUTONUL STILIZAT AICI */}
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
                                name="newPassword"
                                placeholder="Minim 3 caractere"
                                className={`login-input ${errors.newPassword ? 'input-error' : ''}`}
                                onChange={handleChange}
                            />
                            {errors.newPassword && <span className="field-error">{errors.newPassword}</span>}
                        </div>

                        <div className="form-group">
                            <label>Confirmă Parola</label>
                            <input
                                type={showPass ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="Repetă parola"
                                className={`login-input ${errors.confirmPassword ? 'input-error' : ''}`}
                                onChange={handleChange}
                            />
                            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
                        </div>
                    </div>

                    <button type="submit" className="login-btn" disabled={loading} style={{marginTop:'20px'}}>
                        {loading ? 'Se procesează...' : 'ACTIVEAZĂ CONTUL'}
                    </button>
                </form>

                <div className="login-footer" style={{marginTop:'15px'}}>
                    <span onClick={() => navigate('/login')} style={{cursor:'pointer', color:'#0056b3', textDecoration:'underline'}}>
                        Înapoi la Autentificare
                    </span>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;