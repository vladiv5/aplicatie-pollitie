import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LiveSearchInput from './LiveSearchInput';
import './styles/TableStyles.css';

const EditAmenda = ({ id, onSaveSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        motiv: '',
        suma: '',
        starePlata: 'Neplatita', // Default corect
        dataEmitere: '',
        politistId: null,
        persoanaId: null
    });

    const [initialPolitistName, setInitialPolitistName] = useState('');
    const [initialPersoanaName, setInitialPersoanaName] = useState('');

    useEffect(() => {
        if (id) {
            const token = localStorage.getItem('token');
            axios.get(`http://localhost:8080/api/amenzi/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(response => {
                    const data = response.data;
                    setFormData({
                        motiv: data.motiv || '',
                        suma: data.suma || '',
                        // Aici preluam valoarea din DB. Dacă e null, punem default 'Neplatita'
                        starePlata: data.starePlata || 'Neplatita',
                        dataEmitere: data.dataEmitere || '',
                        politistId: data.politist ? data.politist.idPolitist : null,
                        persoanaId: data.persoana ? data.persoana.idPersoana : null
                    });

                    if (data.politist) {
                        setInitialPolitistName(`${data.politist.nume} ${data.politist.prenume} (${data.politist.grad})`);
                    }
                    if (data.persoana) {
                        setInitialPersoanaName(`${data.persoana.nume} ${data.persoana.prenume} (CNP: ${data.persoana.cnp})`);
                    }
                })
                .catch(error => console.error("Eroare încărcare amendă:", error));
        }
    }, [id]);

    const handleSave = () => {
        const token = localStorage.getItem('token');
        const sumaNumar = parseFloat(formData.suma);

        const payload = {
            motiv: formData.motiv,
            suma: sumaNumar,
            starePlata: formData.starePlata,
            dataEmitere: formData.dataEmitere,
            politist: formData.politistId ? { idPolitist: formData.politistId } : null,
            persoana: formData.persoanaId ? { idPersoana: formData.persoanaId } : null
        };

        axios.put(`http://localhost:8080/api/amenzi/${id}`, payload, {
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
                <label>Motiv</label>
                <input
                    type="text" className="modal-input"
                    value={formData.motiv}
                    onChange={(e) => setFormData({...formData, motiv: e.target.value})}
                />

                <label>Suma (RON)</label>
                <input
                    type="number" className="modal-input"
                    value={formData.suma}
                    onChange={(e) => setFormData({...formData, suma: e.target.value})}
                />

                <label>Stare Plată</label>
                {/* Select actualizat cu valorile din DB */}
                <select
                    className="modal-input"
                    value={formData.starePlata}
                    onChange={(e) => setFormData({...formData, starePlata: e.target.value})}
                >
                    <option value="Neplatita">Neplătită</option>
                    <option value="Platita">Plătită</option>
                </select>

                <label>Data și Ora</label>
                <input
                    type="datetime-local" className="modal-input"
                    value={formData.dataEmitere}
                    onChange={(e) => setFormData({...formData, dataEmitere: e.target.value})}
                />

                <LiveSearchInput
                    label="Agent Constatator"
                    placeholder="Caută polițist..."
                    apiUrl="http://localhost:8080/api/politisti/cauta"
                    defaultValue={initialPolitistName}
                    displayKey={(p) => `${p.nume} ${p.prenume} (${p.grad})`}
                    onSelect={(item) => setFormData({...formData, politistId: item ? item.idPolitist : null})}
                />

                <LiveSearchInput
                    label="Persoana Amendată"
                    placeholder="Caută cetățean..."
                    apiUrl="http://localhost:8080/api/persoane/cauta"
                    defaultValue={initialPersoanaName}
                    displayKey={(p) => `${p.nume} ${p.prenume} (CNP: ${p.cnp})`}
                    onSelect={(item) => setFormData({...formData, persoanaId: item ? item.idPersoana : null})}
                />
            </div>

            <div className="modal-footer">
                <button className="save-btn" onClick={handleSave}>Salvează Modificări</button>
            </div>
        </div>
    );
};

export default EditAmenda;