import React, { useState } from 'react';
import axios from 'axios';
import LiveSearchInput from './LiveSearchInput';
import './styles/TableStyles.css';

const AddAmenda = ({ onSaveSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        motiv: '',
        suma: '',
        starePlata: 'Neachitat',
        dataEmitere: '',
        politistId: null,
        persoanaId: null
    });

    const handleSave = () => {
        // 1. Validare câmpuri obligatorii
        if (!formData.motiv || !formData.suma || !formData.persoanaId || !formData.politistId) {
            alert("Te rog completează motivul, suma, polițistul și persoana amendată!");
            return;
        }

        const token = localStorage.getItem('token');

        // 2. Validare numerică pentru Sumă
        const sumaNumar = parseFloat(formData.suma);
        if (isNaN(sumaNumar)) {
            alert("Suma trebuie să fie un număr valid!");
            return;
        }

        // 3. LOGICA DATĂ (CRITIC PENTRU EROAREA 400)
        let dataFinala = formData.dataEmitere;

        if (!dataFinala) {
            // Cazul 1: Nu a ales data -> Punem data curentă
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            // slice(0, 19) păstrează secundele: "YYYY-MM-DDTHH:mm:ss"
            dataFinala = now.toISOString().slice(0, 19);
        } else {
            // Cazul 2: A ales data din calendar HTML (vine ca "2024-12-28T16:00")
            // Trebuie să adăugăm secundele manual, altfel Java dă eroare 400
            if (dataFinala.length === 16) {
                dataFinala += ':00';
            }
        }

        // 4. Construim obiectul
        const payload = {
            motiv: formData.motiv,
            suma: sumaNumar,
            starePlata: formData.starePlata,
            dataEmitere: dataFinala,
            politist: { idPolitist: formData.politistId },
            persoana: { idPersoana: formData.persoanaId }
        };

        // 5. Trimitem cererea (O SINGURĂ DATĂ)
        axios.post('http://localhost:8080/api/amenzi', payload, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(() => {
                onSaveSuccess();
            })
            .catch(err => {
                console.error("Eroare salvare:", err);
                if (err.response && err.response.data) {
                    // Afișăm eroarea exactă de la server pentru debugging
                    alert(`Eroare server: ${JSON.stringify(err.response.data)}`);
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
                <select
                    className="modal-input"
                    value={formData.starePlata}
                    onChange={(e) => setFormData({...formData, starePlata: e.target.value})}
                >
                    <option value="Neachitat">Neachitat</option>
                    <option value="Achitat">Achitat</option>
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