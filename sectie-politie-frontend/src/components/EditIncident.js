import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LiveSearchInput from './LiveSearchInput';
import toast from 'react-hot-toast';
import './styles/Forms.css'; // IMPORTĂM NOILE STILURI

const EditIncident = ({ id, onSaveSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        tipIncident: '',
        status: 'Activ',
        dataEmitere: '',
        descriereLocatie: '',
        descriereIncident: '',
        politistId: null,
        adresaId: null
    });

    const [initialPolitistName, setInitialPolitistName] = useState('');
    const [initialAdresaName, setInitialAdresaName] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (id) {
            const token = localStorage.getItem('token');
            axios.get(`http://localhost:8080/api/incidente/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(response => {
                    const data = response.data;
                    setFormData({
                        tipIncident: data.tipIncident || '',
                        status: data.status || 'Activ',
                        dataEmitere: data.dataEmitere || '',
                        descriereLocatie: data.descriereLocatie || '',
                        descriereIncident: data.descriereIncident || '',
                        politistId: data.politistResponsabil?.idPolitist || null,
                        adresaId: data.adresaIncident?.idAdresa || null
                    });

                    if (data.politistResponsabil) {
                        setInitialPolitistName(`${data.politistResponsabil.nume} ${data.politistResponsabil.prenume} (${data.politistResponsabil.grad})`);
                    }
                    if (data.adresaIncident) {
                        setInitialAdresaName(`${data.adresaIncident.strada} Nr. ${data.adresaIncident.numar}, ${data.adresaIncident.localitate}`);
                    }
                })
                .catch(error => toast.error("Eroare la încărcarea datelor!"));
        }
    }, [id]);

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

        const payload = {
            tipIncident: formData.tipIncident,
            status: formData.status,
            dataEmitere: formData.dataEmitere,
            descriereLocatie: formData.descriereLocatie,
            descriereIncident: formData.descriereIncident,
            idPolitist: formData.politistId,
            idAdresa: formData.adresaId
        };

        axios.put(`http://localhost:8080/api/incidente/${id}`, payload, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then((response) => {
                const updatedId = response.data ? response.data.idIncident : id;
                setErrors({});
                toast.success("Incident actualizat cu succes!");
                onSaveSuccess(updatedId);
            })
            .catch(error => {
                if (error.response && error.response.status === 400) {
                    setErrors(error.response.data);
                    toast.error("Verifică câmpurile invalide!");
                } else {
                    toast.error("Eroare la modificare!");
                }
            });
    };

    // Helper generic pentru input și textarea
    const renderInput = (label, name, type = 'text', Component = 'input') => (
        <div style={{ position: 'relative' }}>
            <label className="form-label">{label}</label>
            <div style={{ position: 'relative' }}>
                <Component
                    type={type}
                    className={`modal-input ${errors[name] ? 'input-error' : ''}`}
                    value={formData[name]}
                    onChange={(e) => handleChange(name, e.target.value)}
                    rows={Component === 'textarea' ? 3 : undefined}
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
                {renderInput("Tip Incident", "tipIncident")}

                <div style={{ position: 'relative' }}>
                    <label className="form-label">Stare Incident</label>
                    <select
                        className="modal-input"
                        value={formData.status}
                        onChange={(e) => handleChange('status', e.target.value)}
                    >
                        <option value="Activ">Activ</option>
                        <option value="Închis">Închis</option>
                        <option value="Arhivat">Arhivat</option>
                    </select>
                </div>

                {renderInput("Data și Ora", "dataEmitere", "datetime-local")}

                <LiveSearchInput
                    label="Polițist Responsabil"
                    apiUrl="http://localhost:8080/api/politisti/cauta"
                    defaultValue={initialPolitistName}
                    displayKey={(p) => `${p.nume} ${p.prenume} (${p.grad})`}
                    onSelect={(item) => setFormData({...formData, politistId: item ? item.idPolitist : null})}
                />

                <LiveSearchInput
                    label="Adresă Incident"
                    apiUrl="http://localhost:8080/api/adrese/cauta"
                    defaultValue={initialAdresaName}
                    displayKey={(a) => `${a.strada} Nr. ${a.numar}, ${a.localitate}`}
                    onSelect={(item) => setFormData({...formData, adresaId: item ? item.idAdresa : null})}
                />

                {renderInput("Descriere Locație", "descriereLocatie")}

                {renderInput("Detalii Incident", "descriereIncident", "text", "textarea")}
            </div>

            <div className="modal-footer">
                <button className="save-btn" onClick={handleSave}>SALVAȚI MODIFICĂRI</button>
            </div>
        </div>
    );
};

export default EditIncident;