import React, { useState } from 'react';
import axios from 'axios';
import LiveSearchInput from './LiveSearchInput';
import './styles/TableStyles.css';
import toast from 'react-hot-toast'; // <--- IMPORT

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

    const handleSave = () => {
        const token = localStorage.getItem('token');
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
            .then(() => {
                setErrors({});
                toast.success("Incident înregistrat cu succes!"); // <--- TOAST
                onSaveSuccess();
            })
            .catch(error => {
                if (error.response && error.response.status === 400) {
                    setErrors(error.response.data);
                    toast.error("Verifică câmpurile invalide!"); // <--- TOAST
                } else {
                    console.error("Eroare salvare:", error);
                    toast.error("Eroare la salvare! Verifică conexiunea."); // <--- TOAST
                }
            });
    };

    return (
        <div>
            <div className="form-group">
                <label>Tip Incident</label>
                <input
                    type="text"
                    placeholder="ex: Furt, Altercație"
                    className="modal-input"
                    value={formData.tipIncident}
                    onChange={(e) => setFormData({...formData, tipIncident: e.target.value})}
                />
                {errors.tipIncident && <span style={{color: 'red', fontSize: '12px'}}>{errors.tipIncident}</span>}

                <label>Stare Incident</label>
                <select
                    className="modal-input"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    style={{backgroundColor: '#f8f9fa'}}
                >
                    <option value="Activ">Activ (În lucru)</option>
                    <option value="Închis">Închis (Rezolvat)</option>
                    <option value="Arhivat">Arhivat (Dosar Vechi)</option>
                </select>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Data și Ora:</label>
                    <input
                        type="datetime-local"
                        className="modal-input"
                        value={formData.dataEmitere}
                        onChange={(e) => setFormData({...formData, dataEmitere: e.target.value})}
                    />
                    {errors.dataEmitere && <span style={{color: 'red', fontSize: '12px'}}>{errors.dataEmitere}</span>}
                </div>

                <LiveSearchInput
                    label="Polițist Responsabil"
                    placeholder="Caută polițist..."
                    apiUrl="http://localhost:8080/api/politisti/cauta"
                    displayKey={(p) => `${p.nume} ${p.prenume} (${p.grad})`}
                    onSelect={(item) => setFormData({...formData, politistId: item ? item.idPolitist : null})}
                />

                <LiveSearchInput
                    label="Adresa Incidentului"
                    placeholder="Caută stradă..."
                    apiUrl="http://localhost:8080/api/adrese/cauta"
                    displayKey={(a) => `${a.strada} Nr. ${a.numar}, ${a.localitate}`}
                    onSelect={(item) => setFormData({...formData, adresaId: item ? item.idAdresa : null})}
                />

                <label>Descriere Locație</label>
                <input
                    type="text"
                    className="modal-input"
                    value={formData.descriereLocatie}
                    onChange={(e) => setFormData({...formData, descriereLocatie: e.target.value})}
                />
                {errors.descriereLocatie && <span style={{color: 'red', fontSize: '12px'}}>{errors.descriereLocatie}</span>}

                <label>Detalii Incident</label>
                <textarea
                    placeholder="Descrieți ce s-a întâmplat..."
                    className="modal-input"
                    rows="4"
                    value={formData.descriereIncident}
                    onChange={(e) => setFormData({...formData, descriereIncident: e.target.value})}
                />
                {errors.descriereIncident && <span style={{color: 'red', fontSize: '12px'}}>{errors.descriereIncident}</span>}
            </div>

            <div className="modal-footer">
                <button className="save-btn" onClick={handleSave}>Salvează Incident</button>
            </div>
        </div>
    );
};

export default AddIncident;