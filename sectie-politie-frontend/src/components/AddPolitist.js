import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AddPolitist = ({ onSaveSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        nume: '', prenume: '', grad: '', functie: '', telefon: ''
    });
    // State pentru erorile venite din Backend
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Ștergem eroarea vizuală când utilizatorul începe să scrie
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    // --- FUNCȚIE ȘTERGERE CÂMP (X) ---
    const handleClear = (fieldName) => {
        setFormData({ ...formData, [fieldName]: '' });
    };

    const handleSave = () => {
        setErrors({}); // Resetăm erorile înainte de request

        axios.post('http://localhost:8080/api/politisti', {
            nume: formData.nume,
            prenume: formData.prenume,
            grad: formData.grad,
            functie: formData.functie,
            telefon_serviciu: formData.telefon
        })
            .then((response) => {
                const newId = response.data ? response.data.idPolitist : null;
                setFormData({ nume: '', prenume: '', grad: '', functie: '', telefon: '' });
                toast.success("Polițist înregistrat în sistem!");
                onSaveSuccess(newId);
            })
            .catch(error => {
                if (error.response && error.response.status === 400) {
                    setErrors(error.response.data);
                    toast.error("Verifică câmpurile invalide!");
                } else {
                    console.error("Eroare:", error);
                    toast.error("Eroare la salvare!");
                }
            });
    };

    // --- HELPER INPUT (Cu X si Erori fara Bold) ---
    const renderInput = (name, placeholder) => (
        <div style={{ position: 'relative', marginBottom: '15px' }}>
            <input
                type="text"
                name={name}
                placeholder={placeholder}
                className={`modal-input ${errors[name] ? 'input-error' : ''}`}
                value={formData[name]}
                onChange={handleChange}
                style={{ paddingRight: '30px' }}
            />
            {formData[name] && (
                <span
                    onClick={() => handleClear(name)}
                    style={{
                        position: 'absolute',
                        right: '10px',
                        top: '12px', // Ajustat manual pentru aliniere
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
            {/* EROAREA: Fără bold acum */}
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
                {renderInput("grad", "Grad")}
                {renderInput("functie", "Funcție")}
                {renderInput("telefon", "Telefon Serviciu")}
            </div>
            <div className="modal-footer">
                <button className="save-btn" onClick={handleSave}>Salvați</button>
            </div>
        </div>
    );
};

export default AddPolitist;