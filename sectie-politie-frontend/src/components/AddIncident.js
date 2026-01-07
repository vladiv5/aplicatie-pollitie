import React, { useState } from 'react';
import axios from 'axios';
import LiveSearchInput from './LiveSearchInput';
import toast from 'react-hot-toast';
import './styles/Forms.css'; // IMPORTĂM NOILE STILURI

const AddIncident = ({ onSaveSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        tipIncident: '',
        status: 'Activ',
        dataEmitere: '',
        descriereLocatie: '',
        descriereIncident: '',
        politistId: null,
        adresaId: null
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
        if (dataFinala.length === 16) {
            dataFinala += ":00";
        }

        const payload = {
            tipIncident: formData.tipIncident,
            status: formData.status,
            dataEmitere: dataFinala,
            descriereLocatie: formData.descriereLocatie,
            descriereIncident: formData.descriereIncident,
            idPolitist: formData.politistId,
            idAdresa: formData.adresaId
        };

        axios.post('http://localhost:8080/api/incidente', payload, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then((response) => {
                const newId = response.data ? response.data.idIncident : null;
                setErrors({});
                toast.success("Incident înregistrat cu succes!");
                onSaveSuccess(newId);
            })
            .catch(error => {
                if (error.response && error.response.status === 400) {
                    setErrors(error.response.data);
                    toast.error("Verifică câmpurile invalide!");
                } else {
                    console.error("Eroare salvare:", error);
                    toast.error("Eroare la salvare! Verifică conexiunea.");
                }
            });
    };

    // Helper generic pentru input și textarea
    const renderInput = (label, name, placeholder, type = 'text', Component = 'input') => (
        <div style={{ position: 'relative' }}>
            <label className="form-label">{label}</label>
            <div style={{ position: 'relative' }}>
                <Component
                    type={type}
                    placeholder={placeholder}
                    className={`modal-input ${errors[name] ? 'input-error' : ''}`}
                    value={formData[name]}
                    onChange={(e) => handleChange(name, e.target.value)}
                    rows={Component === 'textarea' ? 4 : undefined}
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
                {renderInput("Tip Incident", "tipIncident", "ex: Furt, Altercație")}

                {/* Select cu stiluri consistente */}
                <div style={{ position: 'relative' }}>
                    <label className="form-label">Stare Incident</label>
                    <select
                        className="modal-input"
                        value={formData.status}
                        onChange={(e) => handleChange('status', e.target.value)}
                    >
                        <option value="Activ">Activ (În lucru)</option>
                        <option value="Închis">Închis (Rezolvat)</option>
                        <option value="Arhivat">Arhivat (Dosar Vechi)</option>
                    </select>
                </div>

                {renderInput("Data și Ora", "dataEmitere", "", "datetime-local")}

                <LiveSearchInput
                    label="Polițist Responsabil"
                    placeholder="Căutați polițist..."
                    apiUrl="http://localhost:8080/api/politisti/cauta"
                    displayKey={(p) => `${p.nume} ${p.prenume} (${p.grad})`}
                    onSelect={(item) => setFormData({...formData, politistId: item ? item.idPolitist : null})}
                />

                <LiveSearchInput
                    label="Adresa Incidentului"
                    placeholder="Căutați stradă..."
                    apiUrl="http://localhost:8080/api/adrese/cauta"
                    displayKey={(a) => `${a.strada} Nr. ${a.numar}, ${a.localitate}`}
                    onSelect={(item) => setFormData({...formData, adresaId: item ? item.idAdresa : null})}
                />

                {renderInput("Descriere Locație", "descriereLocatie", "Detalii suplimentare despre loc...")}

                {renderInput("Detalii Incident", "descriereIncident", "Descrieți ce s-a întâmplat...", "text", "textarea")}
            </div>

            <div className="modal-footer">
                <button className="save-btn" onClick={handleSave}>SALVAȚI INCIDENT</button>
            </div>
        </div>
    );
};

export default AddIncident;