import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './styles/Forms.css'; // <--- IMPORT THE NEW STYLES

const AddPolitist = ({ onSaveSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        nume: '', prenume: '', grad: '', functie: '', telefon: ''
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
        setErrors({});

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

    // Helper to render input with label, X button, and error
    const renderInput = (name, label, placeholder) => (
        <div style={{ position: 'relative' }}>
            <label className="form-label">{label}</label>
            <div style={{ position: 'relative' }}>
                <input
                    type="text"
                    name={name}
                    placeholder={placeholder}
                    className={`modal-input ${errors[name] ? 'input-error' : ''}`}
                    value={formData[name]}
                    onChange={handleChange}
                />

                {/* Clear Button (X) */}
                {formData[name] && (
                    <span
                        className="clear-icon"
                        onClick={() => handleClear(name)}
                        title="Șterge"
                    >
                        &times;
                    </span>
                )}
            </div>

            {/* Error Message */}
            {errors[name] && (
                <span className="error-text">{errors[name]}</span>
            )}
        </div>
    );

    return (
        <div>
            <div className="form-group">
                {/* We arrange them in a grid or stack. Here is a stack. */}
                {renderInput("nume", "Nume", "ex: Popescu")}
                {renderInput("prenume", "Prenume", "ex: Andrei")}
                {renderInput("grad", "Grad", "ex: Agent Șef")}
                {renderInput("functie", "Funcție", "ex: Patrulare")}
                {renderInput("telefon", "Telefon Serviciu", "ex: 07xx xxx xxx")}
            </div>

            <div className="modal-footer">
                <button className="save-btn" onClick={handleSave}>
                    SALVAȚI POLIȚIST
                </button>
            </div>
        </div>
    );
};

export default AddPolitist;