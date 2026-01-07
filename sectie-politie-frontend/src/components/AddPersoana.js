import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './styles/Forms.css'; // IMPORTĂM NOILE STILURI

const AddPersoana = ({ onSaveSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        nume: '', prenume: '', cnp: '', dataNasterii: '', telefon: ''
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleSave = () => {
        setErrors({});
        axios.post('http://localhost:8080/api/persoane', formData)
            .then((response) => {
                toast.success("Persoană adăugată cu succes!");
                onSaveSuccess(response.data.idPersoana);
            })
            .catch(error => {
                if (error.response && error.response.status === 400) {
                    setErrors(error.response.data);
                    toast.error("Verifică câmpurile invalide!");
                } else {
                    toast.error("Eroare la salvare!");
                }
            });
    };

    const renderInput = (name, label, placeholder, icon, type = 'text') => {
        const hasError = errors[name];
        return (
            <div className="form-group-item">
                <label className="form-label">
                    <i className={`fa-solid ${icon}`} style={{marginRight: '8px', color: '#d4af37'}}></i>
                    {label}
                </label>
                <div className="input-wrapper">
                    <input
                        type={type}
                        name={name}
                        placeholder={placeholder}
                        className={`modal-input ${hasError ? 'input-error' : ''}`}
                        value={formData[name]}
                        onChange={handleChange}
                    />
                    {formData[name] && type !== 'date' && (
                        <button type="button" className="search-clear-btn-gold" onClick={() => setFormData({...formData, [name]: ''})}>
                            <i className="fa-solid fa-circle-xmark"></i>
                        </button>
                    )}
                </div>
                {hasError && <span className="error-text">{errors[name]}</span>}
            </div>
        );
    };

    return (
        <div className="modal-body-scroll">
            <div className="form-grid-stack">
                {renderInput("nume", "Nume", "ex: Popescu", "fa-user-tie")}
                {renderInput("prenume", "Prenume", "ex: Andrei", "fa-user")}
                {renderInput("cnp", "CNP", "13 cifre", "fa-id-card")}
                {renderInput("dataNasterii", "Data Nașterii", "", "fa-calendar-days", "date")}
                {renderInput("telefon", "Telefon", "07xxxxxxxx", "fa-phone")}
            </div>
            <div className="modal-footer" style={{marginTop: '30px'}}>
                <button className="save-btn" onClick={handleSave}>
                    <i className="fa-solid fa-floppy-disk" style={{marginRight: '8px'}}></i>
                    SALVAȚI PERSOANA
                </button>
            </div>
        </div>
    );
};

export default AddPersoana;