import React, { useState } from 'react';
import axios from 'axios';
import LiveSearchInput from './LiveSearchInput';
import './styles/TableStyles.css'; // Asigură-te că importăm stilurile

const AddIncident = ({ onSaveSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        tipIncident: '',
        dataEmitere: '', // <--- Câmp nou pentru Data și Ora
        descriereLocatie: '',
        descriereIncident: '',
        politistId: null,
        adresaId: null
    });

    const handleSave = () => {
        if (!formData.tipIncident || !formData.politistId) {
            alert("Te rog completează Tipul și alege un Polițist!");
            return;
        }

        const token = localStorage.getItem('token');

        let dataFinala = formData.dataEmitere;

        // Dacă userul nu a ales data, punem acum
        if (!dataFinala) {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            dataFinala = now.toISOString().slice(0, 16);
        }

        // --- FIX CRITIC: Adăugăm secunde ":00" dacă lipsesc ---
        // Java crapă dacă primește "2024-05-12T14:30". Vrea "2024-05-12T14:30:00"
        if (dataFinala.length === 16) {
            dataFinala += ":00";
        }

        // --- PAYLOAD SIMPLIFICAT (DTO) ---
        // Trimitem structura "plată" pe care o așteaptă noul Controller
        const payload = {
            tipIncident: formData.tipIncident,
            dataEmitere: dataFinala,
            descriereLocatie: formData.descriereLocatie,
            descriereIncident: formData.descriereIncident,
            idPolitist: formData.politistId, // Trimitem direct ID (Integer)
            idAdresa: formData.adresaId      // Trimitem direct ID (Integer)
        };

        axios.post('http://localhost:8080/api/incidente', payload, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(() => onSaveSuccess())
            .catch(error => {
                console.error("Eroare salvare:", error);
                alert("Eroare la salvare! Verifică consola (Network Tab).");
            });
    };

    return (
        <div>
            <div className="form-group">
                {/* 1. Tip Incident */}
                <input
                    type="text"
                    placeholder="Tip Incident (ex: Furt, Altercație)"
                    className="modal-input"
                    value={formData.tipIncident}
                    onChange={(e) => setFormData({...formData, tipIncident: e.target.value})}
                />

                {/* 2. DATA ȘI ORA (NOUL CÂMP) */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px', marginLeft: '2px' }}>
                        Data și Ora Incidentului:
                    </label>
                    <input
                        type="datetime-local"
                        className="modal-input"
                        value={formData.dataEmitere}
                        onChange={(e) => setFormData({...formData, dataEmitere: e.target.value})}
                    />
                </div>

                {/* 3. LIVE SEARCH POLITIST */}
                <LiveSearchInput
                    label="Polițist Responsabil"
                    placeholder="Caută polițist..."
                    apiUrl="http://localhost:8080/api/politisti/cauta"
                    displayKey={(p) => `${p.nume} ${p.prenume} (${p.grad})`}
                    onSelect={(item) => setFormData({...formData, politistId: item ? item.idPolitist : null})}
                />

                {/* 4. LIVE SEARCH ADRESA */}
                <LiveSearchInput
                    label="Adresa Incidentului"
                    placeholder="Caută stradă..."
                    apiUrl="http://localhost:8080/api/adrese/cauta"
                    displayKey={(a) => `${a.strada} Nr. ${a.numar}, ${a.localitate}`}
                    onSelect={(item) => setFormData({...formData, adresaId: item ? item.idAdresa : null})}
                />

                {/* 5. Descriere Locație */}
                <input
                    type="text"
                    placeholder="Descriere Locație (ex: În fața parcului)"
                    className="modal-input"
                    value={formData.descriereLocatie}
                    onChange={(e) => setFormData({...formData, descriereLocatie: e.target.value})}
                />

                {/* 6. Descriere Detaliată */}
                <textarea
                    placeholder="Detalii Incident..."
                    className="modal-input"
                    rows="3"
                    value={formData.descriereIncident}
                    onChange={(e) => setFormData({...formData, descriereIncident: e.target.value})}
                    style={{ fontFamily: 'inherit' }}
                />
            </div>

            <div className="modal-footer">
                <button className="save-btn" onClick={handleSave}>
                    Salvează Incident
                </button>
            </div>
        </div>
    );
};

export default AddIncident;