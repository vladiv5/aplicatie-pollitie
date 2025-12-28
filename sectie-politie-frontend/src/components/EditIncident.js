import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LiveSearchInput from './LiveSearchInput';
import './styles/TableStyles.css';

const EditIncident = ({ id, onSaveSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        tipIncident: '',
        dataEmitere: '',
        descriereLocatie: '',
        descriereIncident: '',
        politistId: null,
        adresaId: null
    });

    // Stari pentru a pre-completa textul din LiveSearch
    const [initialPolitistName, setInitialPolitistName] = useState('');
    const [initialAdresaName, setInitialAdresaName] = useState('');

    useEffect(() => {
        if (id) {
            const token = localStorage.getItem('token');
            axios.get(`http://localhost:8080/api/incidente/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(response => {
                    const data = response.data;

                    // NU MAI AVEM NEVOIE DE SUBSTRING!
                    // Java trimite deja "2024-01-01T12:00", exact ce vrea input-ul.

                    setFormData({
                        tipIncident: data.tipIncident || '',
                        dataEmitere: data.dataEmitere || '', // Luam direct valoarea
                        descriereLocatie: data.descriereLocatie || '',
                        descriereIncident: data.descriereIncident || '',
                        politistId: data.politistResponsabil?.idPolitist || null,
                        adresaId: data.adresaIncident?.idAdresa || null
                    });

                    // Setam numele initiale pentru LiveSearch
                    if (data.politistResponsabil) {
                        setInitialPolitistName(`${data.politistResponsabil.nume} ${data.politistResponsabil.prenume} (${data.politistResponsabil.grad})`);
                    }
                    if (data.adresaIncident) {
                        setInitialAdresaName(`${data.adresaIncident.strada} Nr. ${data.adresaIncident.numar}, ${data.adresaIncident.localitate}`);
                    }
                })
                .catch(error => console.error("Eroare incarcare incident:", error));
        }
    }, [id]);

    const handleSave = () => {
        const token = localStorage.getItem('token');

        // NU MAI CONVERTIM IN new Date().toISOString()
        // Trimitem string-ul exact asa cum e (ex: "2024-05-20T14:30")
        // Java il va intelege datorita adnotarii @JsonFormat

        const payload = {
            tipIncident: formData.tipIncident,
            dataEmitere: formData.dataEmitere, // Trimitem direct
            descriereLocatie: formData.descriereLocatie,
            descriereIncident: formData.descriereIncident,
            politistResponsabil: formData.politistId ? { idPolitist: formData.politistId } : null,
            adresaIncident: formData.adresaId ? { idAdresa: formData.adresaId } : null
        };

        axios.put(`http://localhost:8080/api/incidente/${id}`, payload, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(() => {
                onSaveSuccess();
            })
            .catch(error => {
                console.error("Eroare update:", error);
                alert("Eroare la modificare!");
            });
    };

    return (
        <div>
            <div className="form-group">
                <label>Tip Incident</label>
                <input
                    type="text" className="modal-input"
                    value={formData.tipIncident}
                    onChange={(e) => setFormData({...formData, tipIncident: e.target.value})}
                />

                <label>Data și Ora</label>
                {/* Input-ul va afisa corect data fara secunde */}
                <input
                    type="datetime-local" className="modal-input"
                    value={formData.dataEmitere}
                    onChange={(e) => setFormData({...formData, dataEmitere: e.target.value})}
                />

                <LiveSearchInput
                    label="Polițist Responsabil"
                    placeholder="Caută polițist..."
                    apiUrl="http://localhost:8080/api/politisti/cauta"
                    defaultValue={initialPolitistName}
                    displayKey={(p) => `${p.nume} ${p.prenume} (${p.grad})`}
                    onSelect={(item) => setFormData({...formData, politistId: item ? item.idPolitist : null})}
                />

                <LiveSearchInput
                    label="Adresă Incident"
                    placeholder="Caută adresă..."
                    apiUrl="http://localhost:8080/api/adrese/cauta"
                    defaultValue={initialAdresaName}
                    displayKey={(a) => `${a.strada} Nr. ${a.numar}, ${a.localitate}`}
                    onSelect={(item) => setFormData({...formData, adresaId: item ? item.idAdresa : null})}
                />

                <label>Descriere Locație</label>
                <input
                    type="text" className="modal-input"
                    value={formData.descriereLocatie}
                    onChange={(e) => setFormData({...formData, descriereLocatie: e.target.value})}
                />

                <label>Detalii Incident</label>
                <textarea
                    className="modal-input" rows="3"
                    value={formData.descriereIncident}
                    onChange={(e) => setFormData({...formData, descriereIncident: e.target.value})}
                />
            </div>

            <div className="modal-footer">
                <button className="save-btn" onClick={handleSave}>
                    Salvează Modificări
                </button>
            </div>
        </div>
    );
};

export default EditIncident;