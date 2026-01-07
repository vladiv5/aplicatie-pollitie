import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './styles/Forms.css';

const AddPolitist = ({ onSaveSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        nume: '', prenume: '', grad: '', functie: '', telefon: ''
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // I clear the error for this field as soon as I start typing
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
        // Special case for phone mapping
        if (name === 'telefon' && errors.telefon_serviciu) {
            setErrors(prev => ({ ...prev, telefon_serviciu: null }));
        }
    };

    const handleSave = () => {
        // I clear previous errors before a new attempt
        setErrors({});

        axios.post('http://localhost:8080/api/politisti', {
            nume: formData.nume,
            prenume: formData.prenume,
            grad: formData.grad,
            functie: formData.functie,
            telefon_serviciu: formData.telefon
        })
            .then((response) => {
                // Toasts remain unchanged as requested
                toast.success("Polițist înregistrat în sistem!");
                onSaveSuccess(response.data.idPolitist);
            })
            .catch(error => {
                if (error.response && error.response.status === 400) {
                    // I map the exact error map from the backend to my state
                    setErrors(error.response.data);
                    toast.error("Verifică câmpurile invalide!");
                } else {
                    toast.error("Eroare la salvare!");
                }
            });
    };

    const renderInput = (name, label, placeholder, icon, backendKey = null) => {
        const errorKey = backendKey || name;
        const hasError = errors[errorKey];

        return (
            <div className="form-group-item">
                <label className="form-label">
                    <i className={`fa-solid ${icon}`} style={{marginRight: '8px', color: '#d4af37'}}></i>
                    {label}
                </label>
                <div className="input-wrapper">
                    <input
                        type="text"
                        name={name}
                        placeholder={placeholder}
                        className={`modal-input ${hasError ? 'input-error' : ''}`}
                        value={formData[name]}
                        onChange={handleChange}
                    />
                    {formData[name] && (
                        <button type="button" className="search-clear-btn-gold" onClick={() => setFormData({...formData, [name]: ''})}>
                            <i className="fa-solid fa-circle-xmark"></i>
                        </button>
                    )}
                </div>
                {/* Fixed red error indication constant across the app */}
                {hasError && <span className="error-text">{errors[errorKey]}</span>}
            </div>
        );
    };

    return (
        <div className="modal-body-scroll">
            <div className="form-grid-stack">
                {renderInput("nume", "Nume", "ex: Popescu", "fa-user-tie")}
                {renderInput("prenume", "Prenume", "ex: Andrei", "fa-user")}
                {renderInput("grad", "Grad", "ex: Agent Șef", "fa-medal")}
                {renderInput("functie", "Funcție", "ex: Patrulare", "fa-briefcase")}
                {renderInput("telefon", "Telefon Serviciu", "07xxxxxxxx", "fa-phone", "telefon_serviciu")}
            </div>
            <div className="modal-footer" style={{marginTop: '30px'}}>
                <button className="save-btn" onClick={handleSave}>
                    <i className="fa-solid fa-floppy-disk" style={{marginRight: '8px'}}></i>
                    SALVAȚI POLIȚIST
                </button>
            </div>
        </div>
    );
};

export default AddPolitist