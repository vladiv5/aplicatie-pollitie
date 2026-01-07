import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './styles/Forms.css'; // IMPORTĂM NOILE STILURI

const EditAdresa = ({ id, onSaveSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        strada: '',
        numar: '',
        bloc: '',
        apartament: '',
        localitate: '',
        judetSauSector: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (id) {
            const token = localStorage.getItem('token');
            axios.get(`http://localhost:8080/api/adrese/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => {
                    const data = res.data;
                    setFormData({
                        strada: data.strada || '',
                        numar: data.numar || '',
                        bloc: data.bloc || '',
                        apartament: data.apartament || '',
                        localitate: data.localitate || '',
                        judetSauSector: data.judetSauSector || ''
                    });
                })
                .catch(err => toast.error("Eroare încărcare date!"));
        }
    }, [id]);

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

        axios.put(`http://localhost:8080/api/adrese/${id}`, payload, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then((response) => {
                const updatedId = response.data ? response.data.idAdresa : id;
                setErrors({});
                toast.success("Adresă actualizată!");
                onSaveSuccess(updatedId);
            })
            .catch(err => {
                if (err.response && err.response.status === 400) {
                    setErrors(err.response.data);
                } else {
                    toast.error("Eroare la modificare!");
                }
            });
    };

    // Helper actualizat (suportă stil container)
    const renderInput = (label, name, containerStyle = {}) => (
        <div style={{ ...containerStyle, position: 'relative' }}>
            <label className="form-label">{label}</label>
            <div style={{ position: 'relative' }}>
                <input
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
                {renderInput("Județ / Sector", "judetSauSector")}
                {renderInput("Localitate", "localitate")}
                {renderInput("Stradă", "strada")}

                <div style={{display:'flex', gap:'10px'}}>
                    {renderInput("Nr.", "numar", { width: '30%' })}
                    {renderInput("Bloc", "bloc", { width: '30%' })}
                    {renderInput("Ap.", "apartament", { width: '30%' })}
                </div>
            </div>

            <div className="modal-footer">
                <button className="save-btn" onClick={handleSave}>SALVAȚI MODIFICĂRI</button>
            </div>
        </div>
    );
};

export default EditAdresa;