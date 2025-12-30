import React, { useState } from 'react';
import axios from 'axios';
import LiveSearchInput from './LiveSearchInput';
import './styles/TableStyles.css';

const AddAmenda = ({ onSaveSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        motiv: '',
        suma: '',
        // MODIFICARE AICI: Default-ul trebuie să fie exact ca în baza de date
        starePlata: 'Neplatita',
        dataEmitere: '',
        politistId: null,
        persoanaId: null
    });

    const handleSave = () => {
        if (!formData.motiv || !formData.suma || !formData.persoanaId || !formData.politistId) {
            alert("Te rog completează toate câmpurile obligatorii!");
            return;
        }

        const token = localStorage.getItem('token');
        const sumaNumar = parseFloat(formData.suma);

        if (isNaN(sumaNumar)) {
            alert("Suma trebuie să fie un număr valid!");
            return;
        }

        // Logica Dată (Formatată corect)
        let dataFinala = formData.dataEmitere;
        if (!dataFinala) {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            dataFinala = now.toISOString().slice(0, 16);
        }

        const payload = {
            motiv: formData.motiv,
            suma: sumaNumar,
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
            .catch(error => {
                console.error("Eroare salvare:", error);
                if (error.response && error.response.data) {
                    alert(`Eroare server: ${JSON.stringify(error.response.data)}`);
                } else {
                    alert("Eroare la salvare! Verifică consola.");
                }
            });
    };

    return (
        <div>
            <div className="form-group">
                <input
                    type="text" placeholder="Motiv Amendă" className="modal-input"
                    value={formData.motiv}
                    onChange={(e) => setFormData({...formData, motiv: e.target.value})}
                />
                <input
                    type="number" placeholder="Sumă (RON)" className="modal-input"
                    value={formData.suma}
                    onChange={(e) => setFormData({...formData, suma: e.target.value})}
                />

                {/* MODIFICARE AICI: Valorile trebuie să fie fix "Neplatita" și "Platita" */}
                <select
                    className="modal-input"
                    value={formData.starePlata}
                    onChange={(e) => setFormData({...formData, starePlata: e.target.value})}
                >
                    <option value="Neplatita">Neplatita</option>
                    <option value="Platita">Platita</option>
                </select>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '12px', color: '#666', marginLeft: '2px' }}>Data Acordării:</label>
                    <input
                        type="datetime-local" className="modal-input"
                        value={formData.dataEmitere}
                        onChange={(e) => setFormData({...formData, dataEmitere: e.target.value})}
                    />
                </div>

                <LiveSearchInput
                    label="Agent Constatator"
                    placeholder="Caută polițist..."
                    apiUrl="http://localhost:8080/api/politisti/cauta"
                    displayKey={(p) => `${p.nume} ${p.prenume} (${p.grad})`}
                    onSelect={(item) => setFormData({...formData, politistId: item?.idPolitist})}
                />

                <LiveSearchInput
                    label="Persoana Amendată"
                    placeholder="Caută cetățean..."
                    apiUrl="http://localhost:8080/api/persoane/cauta"
                    displayKey={(p) => `${p.nume} ${p.prenume} (CNP: ${p.cnp})`}
                    onSelect={(item) => setFormData({...formData, persoanaId: item?.idPersoana})}
                />
            </div>
            <div className="modal-footer">
                <button className="save-btn" onClick={handleSave}>Salvează Amenda</button>
            </div>
        </div>
    );
};

export default AddAmenda;