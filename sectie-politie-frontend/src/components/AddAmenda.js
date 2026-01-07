import React, { useState } from 'react';
import axios from 'axios';
import LiveSearchInput from './LiveSearchInput';
import toast from 'react-hot-toast';
import './styles/Forms.css'; // IMPORTĂM NOILE STILURI

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

    const renderInput = (label, name, placeholder, type = 'text') => (
        <div style={{ position: 'relative' }}>
            <label className="form-label">{label}</label>
            <div style={{ position: 'relative' }}>
                <input
                    type={type}
                    placeholder={placeholder}
                    className={`modal-input ${errors[name] ? 'input-error' : ''}`}
                    value={formData[name]}
                    onChange={(e) => handleChange(name, e.target.value)}
                />

                {formData[name] && type !== 'datetime-local' && (
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
                {renderInput("Motiv", "motiv", "ex: Parcare ilegală")}
                {renderInput("Sumă (RON)", "suma", "0.00", "number")}

                <div style={{ position: 'relative' }}>
                    <label className="form-label">Stare Plată</label>
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
                <button className="save-btn" onClick={handleSave}>SALVAȚI AMENDA</button>
            </div>
        </div>
    );
};

export default AddAmenda;