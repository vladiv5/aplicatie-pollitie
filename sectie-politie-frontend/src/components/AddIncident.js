import React, { useState } from 'react';
import axios from 'axios';
import LiveSearchInput from './LiveSearchInput';
import './styles/TableStyles.css';
import toast from 'react-hot-toast';

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

    // --- FUNCȚIE NOUĂ: ȘTERGERE CÂMP (X) ---
    const handleClear = (fieldName) => {
        setFormData({ ...formData, [fieldName]: '' });
    };

    const handleChange = (fieldName, value) => {
        setFormData({ ...formData, [fieldName]: value });
        // Ștergem eroarea vizuală
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

    // --- HELPER INPUT (Cu X și Erori) ---
    const renderInput = (label, name, placeholder, type = 'text', Component = 'input') => (
        <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>{label}</label>
            <div style={{ position: 'relative' }}>
                <Component
                    type={type}
                    placeholder={placeholder}
                    className={`modal-input ${errors[name] ? 'input-error' : ''}`}
                    value={formData[name]}
                    onChange={(e) => handleChange(name, e.target.value)}
                    rows={Component === 'textarea' ? 4 : undefined}
                    style={{ paddingRight: '30px' }}
                />

                {/* Buton X (Nu îl punem la datetime-local) */}
                {formData[name] && type !== 'datetime-local' && (
                    <span
                        onClick={() => handleClear(name)}
                        style={{
                            position: 'absolute',
                            right: '10px',
                            top: Component === 'textarea' ? '10px' : '50%', // Ajustare pt textarea
                            transform: Component === 'textarea' ? 'none' : 'translateY(-50%)',
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
                {renderInput("Tip Incident", "tipIncident", "ex: Furt, Altercație")}

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Stare Incident</label>
                    <select
                        className="modal-input"
                        value={formData.status}
                        onChange={(e) => handleChange('status', e.target.value)}
                        style={{backgroundColor: '#f8f9fa'}}
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

                {renderInput("Descriere Locație", "descriereLocatie", "")}

                {renderInput("Detalii Incident", "descriereIncident", "Descrieți ce s-a întâmplat...", "text", "textarea")}
            </div>

            <div className="modal-footer">
                <button className="save-btn" onClick={handleSave}>Salvați Incident</button>
            </div>
        </div>
    );
};

export default AddIncident;