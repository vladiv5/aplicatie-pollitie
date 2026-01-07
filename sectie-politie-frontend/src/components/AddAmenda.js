import React, { useState } from 'react';
import axios from 'axios';
import LiveSearchInput from './LiveSearchInput';
import toast from 'react-hot-toast';
import './styles/Forms.css';

const AddAmenda = ({ onSaveSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        motiv: '', suma: '', starePlata: 'Neplatita',
        dataEmitere: '', politistId: null, persoanaId: null
    });
    const [errors, setErrors] = useState({});

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        // Curățăm eroarea când utilizatorul modifică câmpul
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleSave = () => {
        setErrors({});
        // Procesare dată pentru backend (ISO string)
        let dataFinala = formData.dataEmitere;
        if (dataFinala && dataFinala.length === 16) dataFinala += ":00";

        const payload = {
            ...formData,
            dataEmitere: dataFinala,
            idPolitist: formData.politistId,
            idPersoana: formData.persoanaId,
            suma: formData.suma ? parseFloat(formData.suma) : null
        };

        axios.post('http://localhost:8080/api/amenzi', payload)
            .then((response) => {
                toast.success("Amendă emisă cu succes!");
                onSaveSuccess(response.data.idAmenda);
            })
            .catch(error => {
                if (error.response?.status === 400) {
                    // Setăm erorile primite de la backend
                    setErrors(error.response.data);
                    toast.error("Verifică câmpurile invalide!");
                } else {
                    toast.error("Eroare la salvare!");
                }
            });
    };

    // Funcție de randare consistentă cu restul aplicației
    const renderInput = (label, name, icon, type = 'text', placeholder = "") => {
        const hasError = errors[name];
        // Pentru LiveSearchInput mapăm eroarea separat
        if (name === 'politistId' || name === 'persoanaId') return null;

        return (
            <div className="form-group-item">
                <label className="form-label">
                    <i className={`fa-solid ${icon}`} style={{marginRight: '8px', color: '#d4af37'}}></i>
                    {label}
                </label>
                <div className="input-wrapper">
                    <input
                        type={type}
                        placeholder={placeholder}
                        className={`modal-input ${hasError ? 'input-error' : ''}`}
                        value={formData[name]}
                        onChange={(e) => handleChange(name, e.target.value)}
                    />
                    {formData[name] && type !== 'datetime-local' && (
                        <button type="button" className="search-clear-btn-gold" onClick={() => handleChange(name, '')}>
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
                {renderInput("Motiv Amendă", "motiv", "fa-file-signature", "text", "ex: Depășire viteză")}
                {renderInput("Sumă (RON)", "suma", "fa-coins", "number", "0.00")}

                <div className="form-group-item">
                    <label className="form-label"><i className="fa-solid fa-hand-holding-dollar" style={{marginRight: '8px', color: '#d4af37'}}></i>Stare Plată</label>
                    <select className="modal-input" value={formData.starePlata} onChange={(e) => handleChange('starePlata', e.target.value)}>
                        <option value="Neplatita">Neplatita</option>
                        <option value="Platita">Platita</option>
                        <option value="Anulata">Anulata</option>
                    </select>
                </div>

                {renderInput("Data Acordării", "dataEmitere", "fa-calendar-day", "datetime-local")}

                {/* LiveSearchInput cu gestiune de erori */}
                <div className="form-group-item">
                    <LiveSearchInput
                        label="Agent Constatator"
                        apiUrl="http://localhost:8080/api/politisti/cauta"
                        icon="fa-user-shield"
                        onSelect={(item) => handleChange('politistId', item?.idPolitist)}
                    />
                    {errors.idPolitist && <span className="error-text">{errors.idPolitist}</span>}
                </div>

                <div className="form-group-item">
                    <LiveSearchInput
                        label="Persoana Amendată"
                        apiUrl="http://localhost:8080/api/persoane/cauta"
                        icon="fa-user-tag"
                        onSelect={(item) => handleChange('persoanaId', item?.idPersoana)}
                    />
                    {errors.idPersoana && <span className="error-text">{errors.idPersoana}</span>}
                </div>
            </div>
            <div className="modal-footer" style={{marginTop: '30px'}}>
                <button className="save-btn" onClick={handleSave}>
                    <i className="fa-solid fa-file-invoice-dollar" style={{marginRight: '8px'}}></i>
                    SALVAȚI AMENDA
                </button>
            </div>
        </div>
    );
};

export default AddAmenda;