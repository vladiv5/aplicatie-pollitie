import React, { useState } from 'react';
import axios from 'axios';
import './styles/TableStyles.css';
import toast from 'react-hot-toast';

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

    // --- FUNCȚIE NOUĂ: ȘTERGERE CÂMP (X) ---
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

    // --- HELPER INPUT (Cu X și Erori) ---
    const renderInput = (name, placeholder, style = {}) => (
        <div style={{ ...style, position: 'relative', marginBottom: '15px' }}>
            <div style={{ position: 'relative' }}>
                <input
                    name={name}
                    placeholder={placeholder}
                    className={`modal-input ${errors[name] ? 'input-error' : ''}`}
                    value={formData[name]}
                    onChange={handleChange}
                    style={{ paddingRight: '25px', width: '100%' }} // Loc pt X
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
                <span style={{ color: '#dc3545', fontSize: '11px', display: 'block', marginTop: '2px' }}>
                    {errors[name]}
                </span>
            )}
        </div>
    );

    return (
        <div>
            <div className="form-group">
                {renderInput("judetSauSector", "Județ / Sector")}
                {renderInput("localitate", "Localitate")}
                {renderInput("strada", "Stradă")}

                <div style={{display:'flex', gap:'10px'}}>
                    {renderInput("numar", "Nr.", { width: '30%' })}
                    {renderInput("bloc", "Bloc", { width: '30%' })}
                    {renderInput("apartament", "Ap.", { width: '30%' })}
                </div>
            </div>

            <div className="modal-footer">
                <button className="save-btn" onClick={handleSave}>Salvați Adresa</button>
            </div>
        </div>
    );
};

export default AddAdresa;