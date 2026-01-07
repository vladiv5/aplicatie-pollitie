import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './styles/Forms.css'; // IMPORTĂM NOILE STILURI

const EditPolitist = ({ id, onSaveSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        nume: '', prenume: '', grad: '', functie: '', telefon_serviciu: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (id) {
            axios.get(`http://localhost:8080/api/politisti/${id}`)
                .then(res => setFormData(res.data))
                .catch(err => console.error("Eroare:", err));
        }
    }, [id]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // --- FUNCȚIE ȘTERGERE CÂMP ---
    const handleClear = (fieldName) => {
        setFormData({ ...formData, [fieldName]: '' });
    };

    const handleSubmit = () => {
        axios.put(`http://localhost:8080/api/politisti/${id}`, formData)
            .then((response) => {
                toast.success("Polițist actualizat!");
                const savedId = response.data ? response.data.idPolitist : id;
                onSaveSuccess(savedId);
            })
            .catch(error => {
                if (error.response && error.response.status === 400) {
                    setErrors(error.response.data);
                    toast.error("Verifică câmpurile invalide!");
                } else {
                    console.error("Eroare:", error);
                    toast.error("A apărut o eroare la salvare!");
                }
            });
    };

    // --- HELPER ACTUALIZAT (Tactical Style) ---
    const renderInput = (label, name) => (
        <div style={{ position: 'relative' }}>
            <label className="form-label">{label}</label>
            <div style={{ position: 'relative' }}>
                <input
                    type="text"
                    name={name}
                    className={`modal-input ${errors[name] ? 'input-error' : ''}`}
                    value={formData[name] || ''}
                    onChange={handleChange}
                />

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

            {errors[name] && (
                <span className="error-text">{errors[name]}</span>
            )}
        </div>
    );

    return (
        <div>
            <div className="form-group">
                {renderInput("Nume", "nume")}
                {renderInput("Prenume", "prenume")}
                {renderInput("Grad", "grad")}
                {renderInput("Funcție", "functie")}
                {renderInput("Telefon", "telefon_serviciu")}
            </div>
            <div className="modal-footer">
                <button className="save-btn" onClick={handleSubmit}>SALVAȚI MODIFICĂRI</button>
            </div>
        </div>
    );
};

export default EditPolitist;