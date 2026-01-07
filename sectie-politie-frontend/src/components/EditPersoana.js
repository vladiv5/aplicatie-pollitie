import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './styles/Forms.css'; // IMPORTĂM NOILE STILURI

const EditPersoana = ({ id, onSaveSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        nume: '', prenume: '', cnp: '', dataNasterii: '', telefon: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (id) {
            axios.get(`http://localhost:8080/api/persoane/${id}`)
                .then(response => setFormData(response.data))
                .catch(() => toast.error("Eroare la încărcare date persoană."));
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleSave = () => {
        setErrors({});
        axios.put(`http://localhost:8080/api/persoane/${id}`, formData)
            .then((response) => {
                toast.success("Datele au fost actualizate!");
                onSaveSuccess(id);
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

    const renderInput = (label, name, icon, type = "text") => (
        <div className="form-group-item">
            <label className="form-label">
                <i className={`fa-solid ${icon}`} style={{marginRight: '8px', color: '#d4af37'}}></i>
                {label}
            </label>
            <div className="input-wrapper">
                <input
                    type={type}
                    name={name}
                    className={`modal-input ${errors[name] ? 'input-error' : ''}`}
                    value={formData[name] || ''}
                    onChange={handleChange}
                />
                {formData[name] && type !== 'date' && (
                    <button type="button" className="search-clear-btn-gold" onClick={() => setFormData({...formData, [name]: ''})}>
                        <i className="fa-solid fa-circle-xmark"></i>
                    </button>
                )}
            </div>
            {errors[name] && <span className="error-text">{errors[name]}</span>}
        </div>
    );

    return (
        <div className="modal-body-scroll">
            <div className="form-grid-stack">
                {renderInput("Nume", "nume", "fa-user-tie")}
                {renderInput("Prenume", "prenume", "fa-user")}
                {renderInput("CNP", "cnp", "fa-id-card")}
                {renderInput("Data Nașterii", "dataNasterii", "fa-calendar-days", "date")}
                {renderInput("Telefon", "telefon", "fa-phone")}
            </div>
            <div className="modal-footer" style={{marginTop: '30px'}}>
                <button className="save-btn" onClick={handleSave}>
                    <i className="fa-solid fa-pen-to-square" style={{marginRight: '8px'}}></i>
                    SALVAȚI MODIFICĂRI
                </button>
            </div>
        </div>
    );
};

export default EditPersoana;