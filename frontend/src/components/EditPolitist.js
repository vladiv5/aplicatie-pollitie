/**
 * Component for modifying officer data.
 * @author Ivan Vlad-Daniel
 * @version January 11, 2026
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './styles/Forms.css';

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleSubmit = () => {
        setErrors({});
        axios.put(`http://localhost:8080/api/politisti/${id}`, formData)
            .then((response) => {
                toast.success("Modificări salvate!");
                onSaveSuccess(id);
            })
            .catch(error => {
                if (error.response && error.response.status === 400) {
                    setErrors(error.response.data);
                    toast.error("Date invalide!");
                } else {
                    toast.error("Eroare la actualizare!");
                }
            });
    };

    const renderInput = (label, name, icon) => (
        <div className="form-group-item">
            <label className="form-label"><i className={`fa-solid ${icon}`} style={{marginRight: '8px', color: '#d4af37'}}></i>{label}</label>
            <div className="input-wrapper">
                <input
                    type="text"
                    name={name}
                    className={`modal-input ${errors[name] ? 'input-error' : ''}`}
                    value={formData[name] || ''}
                    onChange={handleChange}
                />
                {formData[name] && (
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
                {renderInput("Grad", "grad", "fa-medal")}
                {renderInput("Funcție", "functie", "fa-briefcase")}
                {renderInput("Telefon Serviciu", "telefon_serviciu", "fa-phone")}
            </div>
            <div className="modal-footer" style={{marginTop: '30px'}}>
                <button className="save-btn" onClick={handleSubmit}>
                    <i className="fa-solid fa-pen-to-square" style={{marginRight: '8px'}}></i>
                    SALVAȚI MODIFICĂRI
                </button>
            </div>
        </div>
    );
};

export default EditPolitist;