import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './styles/Forms.css'; // IMPORTĂM NOILE STILURI

const EditPersoana = ({ id, onSaveSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        nume: '',
        prenume: '',
        cnp: '',
        dataNasterii: '',
        telefon: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (id) {
            const token = localStorage.getItem('token');
            axios.get(`http://localhost:8080/api/persoane/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(response => {
                    setFormData(response.data);
                })
                .catch(error => toast.error("Eroare la încărcare date persoană."));
        }
    }, [id]);

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

        axios.put(`http://localhost:8080/api/persoane/${id}`, formData, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then((response) => {
                const updatedId = response.data ? response.data.idPersoana : id;
                setErrors({});
                toast.success("Datele au fost actualizate!");
                onSaveSuccess(updatedId);
            })
            .catch(error => {
                if (error.response && error.response.status === 400) {
                    setErrors(error.response.data);
                    toast.error("Verifică câmpurile invalide!");
                } else {
                    toast.error("Eroare la salvarea modificărilor!");
                }
            });
    };

    // Helper actualizat cu stilurile Tactical
    const renderInput = (label, name, type = "text", maxLength = null) => (
        <div style={{ position: 'relative' }}>
            <label className="form-label">{label}</label>
            <div style={{ position: 'relative' }}>
                <input
                    type={type}
                    name={name}
                    maxLength={maxLength}
                    className={`modal-input ${errors[name] ? 'input-error' : ''}`}
                    value={formData[name] || ''}
                    onChange={handleChange}
                />

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
                {renderInput("CNP", "cnp", "text", 13)}
                {renderInput("Data Nașterii", "dataNasterii", "date")}
                {renderInput("Telefon", "telefon")}
            </div>

            <div className="modal-footer">
                <button className="save-btn" onClick={handleSave}>
                    SALVAȚI MODIFICĂRI
                </button>
            </div>
        </div>
    );
};

export default EditPersoana;