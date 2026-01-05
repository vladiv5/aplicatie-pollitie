import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/TableStyles.css';
import toast from 'react-hot-toast';

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

    // --- FUNCȚII NOI (X) ---
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

    // --- HELPER INPUT EDIT (Cu Label, X si Erori) ---
    const renderInput = (label, name, style = {}) => (
        <div style={{ ...style, marginBottom: '15px' }}>
            <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>{label}</label>
            <div style={{ position: 'relative' }}>
                <input
                    name={name}
                    className={`modal-input ${errors[name] ? 'input-error' : ''}`}
                    value={formData[name] || ''}
                    onChange={handleChange}
                    style={{ paddingRight: '25px', width: '100%' }}
                />

                {formData[name] && (
                    <span
                        onClick={() => handleClear(name)}
                        style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            cursor: 'pointer',
                            color: '#999',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            lineHeight: '1',
                            userSelect: 'none'
                        }}
                        title="Șterge"
                    >
                        &times;
                    </span>
                )}
            </div>
            {errors[name] && (
                <span style={{ color: '#dc3545', fontSize: '11px', display:'block', marginTop:'2px' }}>
                    {errors[name]}
                </span>
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
                <button className="save-btn" onClick={handleSave}>Salvați Modificări</button>
            </div>
        </div>
    );
};

export default EditAdresa;