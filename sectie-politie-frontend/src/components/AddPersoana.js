import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './styles/TableStyles.css';

const AddPersoana = ({ onSaveSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        nume: '',
        prenume: '',
        cnp: '',
        dataNasterii: '',
        telefon: ''
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Ștergem eroarea vizuală când utilizatorul scrie
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    // --- FUNCȚIE ȘTERGERE CÂMP (X) ---
    const handleClear = (fieldName) => {
        setFormData({ ...formData, [fieldName]: '' });
    };

    const handleSave = () => {
        const token = localStorage.getItem('token');
        setErrors({}); // Resetăm erorile

        axios.post('http://localhost:8080/api/persoane', formData, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then((response) => {
                const newId = response.data ? response.data.idPersoana : null;
                setErrors({});
                toast.success("Persoană adăugată cu succes!");
                onSaveSuccess(newId);
            })
            .catch(error => {
                if (error.response && error.response.status === 400) {
                    setErrors(error.response.data);
                    toast.error("Verifică câmpurile invalide!");
                } else {
                    console.error(error);
                    toast.error("Eroare la salvare!");
                }
            });
    };

    // --- HELPER INPUT (Cu X, Erori și suport pentru Data/MaxLength) ---
    const renderInput = (name, placeholder, type = 'text', maxLength = null, label = null) => (
        <div style={{ marginBottom: '15px' }}>
            {/* Afișăm label doar dacă este specificat (ex: la Data Nașterii) */}
            {label && (
                <label style={{ fontSize: '12px', color: '#666', marginLeft: '2px', display: 'block', marginBottom: '5px' }}>
                    {label}
                </label>
            )}

            <div style={{ position: 'relative' }}>
                <input
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    className={`modal-input ${errors[name] ? 'input-error' : ''}`}
                    value={formData[name]}
                    onChange={handleChange}
                    style={{ paddingRight: '30px' }}
                />

                {/* Butonul X (Apare doar dacă avem text și nu e tip 'date' - la date browserele pun X-ul lor uneori, dar îl punem și noi pt consistență dacă dorești) */}
                {/* Notă: La type='date', value e mereu validă sau goală, X-ul nostru o va goli */}
                {formData[name] && (
                    <span
                        onClick={() => handleClear(name)}
                        style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            cursor: 'pointer',
                            color: '#999',
                            fontWeight: 'bold',
                            fontSize: '18px',
                            lineHeight: '1',
                            userSelect: 'none'
                        }}
                        title="Șterge"
                    >
                        &times;
                    </span>
                )}
            </div>

            {/* Mesaj Eroare (fără bold) */}
            {errors[name] && (
                <span style={{ color: '#dc3545', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                    {errors[name]}
                </span>
            )}
        </div>
    );

    return (
        <div>
            <div className="form-group">
                {renderInput("nume", "Nume")}
                {renderInput("prenume", "Prenume")}
                {renderInput("cnp", "CNP", "text", 13)}

                {/* Aici folosim parametrul label pentru Data Nașterii */}
                {renderInput("dataNasterii", "", "date", null, "Data Nașterii:")}

                {renderInput("telefon", "Telefon")}
            </div>

            <div className="modal-footer">
                <button className="save-btn" onClick={handleSave}>
                    Salvați Persoana
                </button>
            </div>
        </div>
    );
};

export default AddPersoana;