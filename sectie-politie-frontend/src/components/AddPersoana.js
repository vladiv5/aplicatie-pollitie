import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './styles/Forms.css'; // IMPORTĂM NOILE STILURI

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
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const handleClear = (fieldName) => {
        setFormData({ ...formData, [fieldName]: '' });
    };

    const handleSave = () => {
        const token = localStorage.getItem('token');
        setErrors({});

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

    // Helper actualizat cu clasele din Forms.css
    const renderInput = (name, label, placeholder, type = 'text', maxLength = null) => (
        <div style={{ position: 'relative' }}>
            <label className="form-label">{label}</label>
            <div style={{ position: 'relative' }}>
                <input
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    className={`modal-input ${errors[name] ? 'input-error' : ''}`}
                    value={formData[name]}
                    onChange={handleChange}
                />

                {/* Buton X - folosim clasa .clear-icon */}
                {formData[name] && type !== 'date' && (
                    <span
                        className="clear-icon"
                        onClick={() => handleClear(name)}
                        title="Șterge"
                    >
                        &times;
                    </span>
                )}
            </div>

            {/* Mesaj Eroare - folosim clasa .error-text */}
            {errors[name] && (
                <span className="error-text">{errors[name]}</span>
            )}
        </div>
    );

    return (
        <div>
            <div className="form-group">
                {renderInput("nume", "Nume", "ex: Ionescu")}
                {renderInput("prenume", "Prenume", "ex: Maria")}
                {renderInput("cnp", "CNP", "13 cifre", "text", 13)}
                {renderInput("dataNasterii", "Data Nașterii", "", "date")}
                {renderInput("telefon", "Telefon", "ex: 07xx xxx xxx")}
            </div>

            <div className="modal-footer">
                <button className="save-btn" onClick={handleSave}>
                    SALVAȚI PERSOANA
                </button>
            </div>
        </div>
    );
};

export default AddPersoana;