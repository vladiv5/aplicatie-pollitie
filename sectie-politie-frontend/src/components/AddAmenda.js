import React, { useState } from 'react';
import axios from 'axios';
import LiveSearchInput from './LiveSearchInput';
import './styles/TableStyles.css';
import toast from 'react-hot-toast';

const AddAmenda = ({ onSaveSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        motiv: '',
        suma: '',
        starePlata: 'Neplatita',
        dataEmitere: '',
        politistId: null,
        persoanaId: null
    });
    const [errors, setErrors] = useState({});

    // --- FUNCȚIE NOUĂ: ȘTERGERE CÂMP (X) ---
    const handleClear = (fieldName) => {
        setFormData({ ...formData, [fieldName]: '' });
    };

    const handleChange = (fieldName, value) => {
        setFormData({ ...formData, [fieldName]: value });
        if (errors[fieldName]) {
            setErrors({ ...errors, [fieldName]: null });
        }
    };

    const handleSave = () => {
        const token = localStorage.getItem('token');
        setErrors({});

        let dataFinala = formData.dataEmitere;
        if (!dataFinala) {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            dataFinala = now.toISOString().slice(0, 16);
        }
        if (dataFinala.length === 16) dataFinala += ":00";

        const sumaNumar = formData.suma ? parseFloat(formData.suma) : null;

        const payload = {
            motiv: formData.motiv,
            suma: sumaNumar,
            starePlata: formData.starePlata,
            dataEmitere: dataFinala,
            idPolitist: formData.politistId,
            idPersoana: formData.persoanaId
        };

        axios.post('http://localhost:8080/api/amenzi', payload, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then((response) => {
                const newId = response.data ? response.data.idAmenda : null;
                setErrors({});
                toast.success("Amendă emisă cu succes!");
                onSaveSuccess(newId);
            })
            .catch(error => {
                if (error.response && error.response.status === 400) {
                    setErrors(error.response.data);
                    toast.error("Verifică câmpurile invalide!");
                } else {
                    console.error("Eroare salvare:", error);
                    toast.error("Eroare la salvare!");
                }
            });
    };

    // --- HELPER INPUT (Cu X si Erori) ---
    const renderInput = (label, name, placeholder, type = 'text') => (
        <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>{label}</label>
            <div style={{ position: 'relative' }}>
                <input
                    type={type}
                    placeholder={placeholder}
                    className={`modal-input ${errors[name] ? 'input-error' : ''}`}
                    value={formData[name]}
                    onChange={(e) => handleChange(name, e.target.value)}
                    style={{ paddingRight: '30px' }}
                />

                {/* Buton X (Nu îl punem la datetime-local) */}
                {formData[name] && type !== 'datetime-local' && (
                    <span
                        onClick={() => handleClear(name)}
                        style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            cursor: 'pointer',
                            color: '#999',
                            fontWeight: 'bold',
                            fontSize: '18px',
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
                <span style={{ color: '#dc3545', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                    {errors[name]}
                </span>
            )}
        </div>
    );

    return (
        <div>
            <div className="form-group">
                {renderInput("Motiv", "motiv", "ex: Parcare ilegală")}
                {renderInput("Sumă (RON)", "suma", "", "number")}

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Stare Plată</label>
                    <select
                        className="modal-input"
                        value={formData.starePlata}
                        onChange={(e) => handleChange('starePlata', e.target.value)}
                    >
                        <option value="Neplatita">Neplatita</option>
                        <option value="Platita">Platita</option>
                        <option value="Anulata">Anulata</option>
                    </select>
                </div>

                {renderInput("Data Acordării", "dataEmitere", "", "datetime-local")}

                <LiveSearchInput
                    label="Agent Constatator"
                    placeholder="Căutați polițist..."
                    apiUrl="http://localhost:8080/api/politisti/cauta"
                    displayKey={(p) => `${p.nume} ${p.prenume} (${p.grad})`}
                    onSelect={(item) => setFormData({...formData, politistId: item?.idPolitist})}
                />

                <LiveSearchInput
                    label="Persoana Amendată"
                    placeholder="Căutați cetățean..."
                    apiUrl="http://localhost:8080/api/persoane/cauta"
                    displayKey={(p) => `${p.nume} ${p.prenume} (CNP: ${p.cnp})`}
                    onSelect={(item) => setFormData({...formData, persoanaId: item?.idPersoana})}
                />
            </div>
            <div className="modal-footer">
                <button className="save-btn" onClick={handleSave}>Salvați Amenda</button>
            </div>
        </div>
    );
};

export default AddAmenda;