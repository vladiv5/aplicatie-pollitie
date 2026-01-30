/**
 * Component for registering a new incident (case file).
 * @author Ivan Vlad-Daniel
 * @version January 11, 2026
 */
import React, { useState } from 'react';
import axios from 'axios';
import LiveSearchInput from './LiveSearchInput';
import toast from 'react-hot-toast';
import './styles/Forms.css';

const AddIncident = ({ onSaveSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        tipIncident: '', status: 'Activ', dataEmitere: '',
        descriereLocatie: '', descriereIncident: '',
        politistId: null, adresaId: null
    });
    const [errors, setErrors] = useState({});

    const handleChange = (fieldName, value) => {
        setFormData({ ...formData, [fieldName]: value });
        if (errors[fieldName]) setErrors(prev => ({ ...prev, [fieldName]: null }));
    };

    const handleSave = () => {
        setErrors({});
        // I normalize the date string for backend parsing.
        let dataFinala = formData.dataEmitere;
        if (dataFinala && dataFinala.length === 16) dataFinala += ":00";

        // I construct the payload matching the backend DTO.
        const payload = { ...formData, dataEmitere: dataFinala, idPolitist: formData.politistId, idAdresa: formData.adresaId };

        axios.post('http://localhost:8080/api/incidente', payload)
            .then((response) => {
                toast.success("Incident înregistrat cu succes!");
                onSaveSuccess(response.data.idIncident);
            })
            .catch(error => {
                if (error.response && error.response.status === 400) {
                    setErrors(error.response.data);
                    toast.error("Verifică câmpurile invalide!");
                } else {
                    toast.error("Eroare la salvare!");
                }
            });
    };

    const renderInput = (label, name, icon, type = 'text', Component = 'input') => {
        const hasError = errors[name];
        return (
            <div className="form-group-item">
                <label className="form-label">
                    <i className={`fa-solid ${icon}`} style={{marginRight: '8px', color: '#d4af37'}}></i>
                    {label}
                </label>
                <div className="input-wrapper">
                    <Component
                        type={type}
                        className={`modal-input ${hasError ? 'input-error' : ''}`}
                        value={formData[name]}
                        onChange={(e) => handleChange(name, e.target.value)}
                        rows={Component === 'textarea' ? 4 : undefined}
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
                {renderInput("Tip Incident", "tipIncident", "fa-triangle-exclamation")}

                <div className="form-group-item">
                    <label className="form-label"><i className="fa-solid fa-signal" style={{marginRight: '8px', color: '#d4af37'}}></i>Stare Incident</label>
                    <select className="modal-input" value={formData.status} onChange={(e) => handleChange('status', e.target.value)}>
                        <option value="Activ">Activ (În lucru)</option>
                        <option value="Închis">Închis (Rezolvat)</option>
                        <option value="Arhivat">Arhivat (Dosar Vechi)</option>
                    </select>
                </div>

                {renderInput("Data și Ora", "dataEmitere", "fa-clock", "datetime-local")}

                <LiveSearchInput
                    label="Polițist Responsabil"
                    apiUrl="http://localhost:8080/api/politisti/cauta"
                    icon="fa-user-shield"
                    displayKey={(p) => `${p.nume} ${p.prenume} (${p.grad})`}
                    onSelect={(item) => handleChange('politistId', item ? item.idPolitist : null)}
                />

                <LiveSearchInput
                    label="Adresa Incidentului"
                    apiUrl="http://localhost:8080/api/adrese/cauta"
                    icon="fa-map-location-dot"
                    displayKey={(a) => `${a.strada} Nr. ${a.numar}, ${a.localitate}`}
                    onSelect={(item) => handleChange('adresaId', item ? item.idAdresa : null)}
                />

                {renderInput("Descriere Locație", "descriereLocatie", "fa-map-pin")}
                {renderInput("Detalii Incident", "descriereIncident", "fa-file-lines", "text", "textarea")}
            </div>
            <div className="modal-footer" style={{marginTop: '30px'}}>
                <button className="save-btn" onClick={handleSave}>
                    <i className="fa-solid fa-floppy-disk" style={{marginRight: '8px'}}></i>
                    SALVAȚI INCIDENT
                </button>
            </div>
        </div>
    );
};

export default AddIncident;