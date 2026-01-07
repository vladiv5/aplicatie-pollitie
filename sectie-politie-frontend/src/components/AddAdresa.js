import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './styles/Forms.css'; // IMPORTĂM NOILE STILURI

const AddAdresa = ({ onSaveSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        strada: '',
        numar: '',
        bloc: '',
        apartament: '',
        localitate: '',
        judetSauSector: ''
    });
    const [errors, setErrors] = useState({});

    const handleClear = (fieldName) => {
        setFormData({ ...formData, [fieldName]: '' });
    };

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const handleSave = () => {
        const token = localStorage.getItem('token');
        setErrors({});

        const payload = {
            ...formData,
            apartament: formData.apartament ? formData.apartament : null
        };

        axios.post('http://localhost:8080/api/adrese', payload, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then((response) => {
                const newId = response.data ? response.data.idAdresa : null;
                setErrors({});
                toast.success("Adresă înregistrată!");
                onSaveSuccess(newId);
            })
            .catch(err => {
                if (err.response && err.response.status === 400) {
                    setErrors(err.response.data);
                    toast.error("Verifică câmpurile invalide!");
                } else {
                    toast.error("Eroare la salvare!");
                }
            });
    };

    // Helper actualizat (permite stiluri extra pentru containerul părint)
    const renderInput = (name, label, placeholder, containerStyle = {}) => (
        <div style={{ ...containerStyle, position: 'relative' }}>
            <label className="form-label">{label}</label>
            <div style={{ position: 'relative' }}>
                <input
                    name={name}
                    placeholder={placeholder}
                    className={`modal-input ${errors[name] ? 'input-error' : ''}`}
                    value={formData[name]}
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
                {renderInput("judetSauSector", "Județ / Sector", "ex: București / Sector 1")}
                {renderInput("localitate", "Localitate", "ex: București")}
                {renderInput("strada", "Stradă", "ex: Calea Victoriei")}

                {/* Grid pentru detalii număr */}
                <div style={{display:'flex', gap:'10px'}}>
                    {renderInput("numar", "Nr.", "ex: 12", { width: '30%' })}
                    {renderInput("bloc", "Bloc", "ex: M3", { width: '30%' })}
                    {renderInput("apartament", "Ap.", "ex: 5", { width: '30%' })}
                </div>
            </div>

            <div className="modal-footer">
                <button className="save-btn" onClick={handleSave}>SALVAȚI ADRESA</button>
            </div>
        </div>
    );
};

export default AddAdresa;