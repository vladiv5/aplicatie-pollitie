import React, { useState } from 'react';
import axios from 'axios';
import LiveSearchInput from './LiveSearchInput'; // Asigură-te că există
import './styles/TableStyles.css';

const AddAmenda = ({ onSaveSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        motiv: '',
        suma: '',
        starePlata: 'Neachitat', // Default
        dataEmitere: '', // Opțional, altfel punem data curentă
        politistId: null,
        persoanaId: null
    });

    const handleSave = () => {
        // Validare: Motiv, Sumă, Polițist și Persoană sunt obligatorii
        if (!formData.motiv || !formData.suma || !formData.persoanaId || !formData.politistId) {
            alert("Te rog completează motivul, suma, polițistul și persoana amendată!");
            return;
        }

        const token = localStorage.getItem('token');

        // Dacă nu alege data, punem data curentă în format ISO
        let dataFinala;
        if (formData.dataEmitere) {
            dataFinala = new Date(formData.dataEmitere).toISOString();
        } else {
            dataFinala = new Date().toISOString();
        }

        const payload = {
            motiv: formData.motiv,
            suma: parseFloat(formData.suma),
            starePlata: formData.starePlata,
            dataEmitere: dataFinala,
            politist: { idPolitist: formData.politistId },
            persoana: { idPersoana: formData.persoanaId }
        };

        axios.post('http://localhost:8080/api/amenzi', payload, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(() => {
                onSaveSuccess();
            })
            .catch(err => {
                console.error("Eroare salvare:", err);
                alert("Eroare la salvare! Verifică consola.");
            });
    };

    return (
        <div>
            <div className="form-group">
                {/* Motiv */}
                <input
                    type="text"
                    placeholder="Motiv Amendă (ex: Viteza, Centura)"
                    className="modal-input"
                    value={formData.motiv}
                    onChange={(e) => setFormData({...formData, motiv: e.target.value})}
                />

                {/* Suma */}
                <input
                    type="number"
                    placeholder="Sumă (RON)"
                    className="modal-input"
                    value={formData.suma}
                    onChange={(e) => setFormData({...formData, suma: e.target.value})}
                />

                {/* Stare Plata */}
                <select
                    className="modal-input"
                    value={formData.starePlata}
                    onChange={(e) => setFormData({...formData, starePlata: e.target.value})}
                >
                    <option value="Neachitat">Neachitat</option>
                    <option value="Achitat">Achitat</option>
                </select>

                {/* Data și Ora (Opțional) */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '12px', color: '#666', marginLeft: '2px' }}>Data Acordării:</label>
                    <input
                        type="datetime-local"
                        className="modal-input"
                        value={formData.dataEmitere}
                        onChange={(e) => setFormData({...formData, dataEmitere: e.target.value})}
                    />
                </div>

                {/* Live Search: AGENT CONSTATATOR */}
                <LiveSearchInput
                    label="Agent Constatator"
                    placeholder="Caută polițist..."
                    apiUrl="http://localhost:8080/api/politisti/cauta"
                    displayKey={(p) => `${p.nume} ${p.prenume} (${p.grad})`}
                    onSelect={(item) => setFormData({...formData, politistId: item?.idPolitist})}
                />

                {/* Live Search: PERSOANA AMENDATA */}
                <LiveSearchInput
                    label="Persoana Amendată"
                    placeholder="Caută cetățean..."
                    apiUrl="http://localhost:8080/api/persoane/cauta"
                    displayKey={(p) => `${p.nume} ${p.prenume} (CNP: ${p.cnp})`}
                    onSelect={(item) => setFormData({...formData, persoanaId: item?.idPersoana})}
                />
            </div>

            <div className="modal-footer">
                <button className="save-btn" onClick={handleSave}>
                    Salvează Amenda
                </button>
            </div>
        </div>
    );
};

export default AddAmenda;