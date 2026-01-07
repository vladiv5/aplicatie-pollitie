import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './styles/Forms.css'; // IMPORTĂM NOILE STILURI

const AddAdresa = ({ onSaveSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        strada: '', numar: '', bloc: '', apartament: '', localitate: '', judetSauSector: ''
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleSave = () => {
        setErrors({});
        axios.post('http://localhost:8080/api/adrese', formData)
            .then((response) => {
                toast.success("Adresă înregistrată!");
                onSaveSuccess(response.data.idAdresa);
            })
            .catch(err => {
                if (err.response?.status === 400) {
                    setErrors(err.response.data);
                    toast.error("Verifică câmpurile invalide!");
                } else {
                    toast.error("Eroare la salvare!");
                }
            });
    };

    const renderInput = (name, label, placeholder, icon, containerStyle = {}) => {
        const hasError = errors[name];
        return (
            <div className="form-group-item" style={containerStyle}>
                <label className="form-label">
                    <i className={`fa-solid ${icon}`} style={{marginRight: '8px', color: '#d4af37'}}></i>
                    {label}
                </label>
                <div className="input-wrapper">
                    <input
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
                {hasError && <span className="error-text">{errors[name]}</span>}
            </div>
        );
    };

    return (
        <div className="modal-body-scroll">
            <div className="form-grid-stack">
                {renderInput("judetSauSector", "Județ / Sector", "ex: București", "fa-map")}
                {renderInput("localitate", "Localitate", "ex: București", "fa-city")}
                {renderInput("strada", "Stradă", "ex: Calea Victoriei", "fa-road")}

                <div style={{display:'flex', gap:'10px'}}>
                    {renderInput("numar", "Nr.", "ex: 12", "fa-house-chimney", { width: '33%' })}
                    {renderInput("bloc", "Bloc", "ex: M3", "fa-building", { width: '33%' })}
                    {renderInput("apartament", "Ap.", "ex: 5", "fa-door-open", { width: '33%' })}
                </div>
            </div>
            <div className="modal-footer" style={{marginTop: '30px'}}>
                <button className="save-btn" onClick={handleSave}>
                    <i className="fa-solid fa-floppy-disk" style={{marginRight: '8px'}}></i>
                    SALVAȚI ADRESA
                </button>
            </div>
        </div>
    );
};

export default AddAdresa;