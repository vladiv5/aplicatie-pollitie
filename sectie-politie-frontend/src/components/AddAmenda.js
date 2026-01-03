import React, { useState } from 'react';
import axios from 'axios';
import LiveSearchInput from './LiveSearchInput';
import './styles/TableStyles.css';

const AddAmenda = ({ onSaveSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        motiv: '',
        suma: '',
        starePlata: 'Neplatita',
        dataEmitere: '',
        politistId: null,
        persoanaId: null
    });
    // State erori
    const [errors, setErrors] = useState({});

    const handleSave = () => {
        // --- VALIDARE MUTATĂ ÎN BACKEND ---

        const token = localStorage.getItem('token');
        let dataFinala = formData.dataEmitere;

        if (!dataFinala) {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            dataFinala = now.toISOString().slice(0, 16);
        }
        if (dataFinala.length === 16) dataFinala += ":00";

        // Convertim suma la numar sau null daca e goala (dar validarea cere NotNull)
        const sumaNumar = formData.suma ? parseFloat(formData.suma) : null;

        const payload = {
            motiv: formData.motiv,
            suma: sumaNumar,
            starePlata: formData.starePlata,
            dataEmitere: dataFinala,
            idPolitist: formData.politistId, // Trimitem ID direct
            idPersoana: formData.persoanaId // Trimitem ID direct
        };

        axios.post('http://localhost:8080/api/amenzi', payload, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(() => {
                setErrors({});
                onSaveSuccess();
            })
            .catch(error => {
                if (error.response && error.response.status === 400) {
                    setErrors(error.response.data);
                } else {
                    console.error("Eroare salvare:", error);
                    alert("Eroare server!");
                }
            });
    };

    return (
        <div>
            <div className="form-group">
                <label>Motiv</label>
                <input
                    type="text" placeholder="ex: Parcare ilegală" className="modal-input"
                    value={formData.motiv}
                    onChange={(e) => setFormData({...formData, motiv: e.target.value})}
                />
                {errors.motiv && <span style={{color: 'red', fontSize: '12px'}}>{errors.motiv}</span>}

                <label>Sumă (RON)</label>
                <input
                    type="number" className="modal-input"
                    value={formData.suma}
                    onChange={(e) => setFormData({...formData, suma: e.target.value})}
                />
                {errors.suma && <span style={{color: 'red', fontSize: '12px'}}>{errors.suma}</span>}

                <label>Stare Plată</label>
                <select
                    className="modal-input"
                    value={formData.starePlata}
                    onChange={(e) => setFormData({...formData, starePlata: e.target.value})}
                >
                    <option value="Neplatita">Neplatita</option>
                    <option value="Platita">Platita</option>
                    <option value="Anulata">Anulata</option>
                </select>
                {errors.starePlata && <span style={{color: 'red', fontSize: '12px'}}>{errors.starePlata}</span>}

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '12px', color: '#666', marginLeft: '2px' }}>Data Acordării:</label>
                    <input
                        type="datetime-local" className="modal-input"
                        value={formData.dataEmitere}
                        onChange={(e) => setFormData({...formData, dataEmitere: e.target.value})}
                    />
                    {errors.dataEmitere && <span style={{color: 'red', fontSize: '12px'}}>{errors.dataEmitere}</span>}
                </div>

                <LiveSearchInput
                    label="Agent Constatator"
                    placeholder="Caută polițist..."
                    apiUrl="http://localhost:8080/api/politisti/cauta"
                    displayKey={(p) => `${p.nume} ${p.prenume} (${p.grad})`}
                    onSelect={(item) => setFormData({...formData, politistId: item?.idPolitist})}
                />
                {/* Nu avem eroare aici, e optional */}

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