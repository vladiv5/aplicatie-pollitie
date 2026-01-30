/**
 * Component for editing an existing address.
 * @author Ivan Vlad-Daniel
 * @version January 11, 2026
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './styles/Forms.css';

const EditAdresa = ({ id, onSaveSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        strada: '', numar: '', bloc: '', apartament: '', localitate: '', judetSauSector: ''
    });
    const [errors, setErrors] = useState({});

    // I fetch existing data when the component mounts.
    useEffect(() => {
        if (id) {
            axios.get(`http://localhost:8080/api/adrese/${id}`)
                .then(res => setFormData(res.data))
                .catch(() => toast.error("Eroare încărcare date!"));
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({...formData, [name]: value});
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleSave = () => {
        setErrors({});
        // I use PUT to update the resource.
        axios.put(`http://localhost:8080/api/adrese/${id}`, formData)
            .then((response) => {
                toast.success("Adresă actualizată!");
                onSaveSuccess(id);
            })
            .catch(err => {
                if (err.response?.status === 400) setErrors(err.response.data);
                toast.error("Eroare la modificare!");
            });
    };

    const renderInput = (label, name, icon, containerStyle = {}) => (
        <div className="form-group-item" style={containerStyle}>
            <label className="form-label"><i className={`fa-solid ${icon}`} style={{marginRight: '8px', color: '#d4af37'}}></i>{label}</label>
            <div className="input-wrapper">
                <input
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
                {renderInput("Județ / Sector", "judetSauSector", "fa-map")}
                {renderInput("Localitate", "localitate", "fa-city")}
                {renderInput("Stradă", "strada", "fa-road")}

                <div style={{display:'flex', gap:'10px'}}>
                    {renderInput("Nr.", "numar", "fa-house-chimney", { width: '33%' })}
                    {renderInput("Bloc", "bloc", "fa-building", { width: '33%' })}
                    {renderInput("Ap.", "apartament", "fa-door-open", { width: '33%' })}
                </div>
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

export default EditAdresa;