import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LiveSearchInput from './LiveSearchInput';
import './styles/TableStyles.css';

const EditAmenda = ({ id, onSaveSuccess, onCancel }) => {
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

    // State pt afisarea numelor in Live Search
    const [initialPolitistName, setInitialPolitistName] = useState('');
    const [initialPersoanaName, setInitialPersoanaName] = useState('');

    useEffect(() => {
        if (id) {
            const token = localStorage.getItem('token');
            axios.get(`http://localhost:8080/api/amenzi/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => {
                    const data = res.data;
                    setFormData({
                        motiv: data.motiv || '',
                        suma: data.suma || '',
                        starePlata: data.starePlata || 'Neplatita',
                        dataEmitere: data.dataEmitere || '',
                        politistId: data.politist?.idPolitist || null,
                        persoanaId: data.persoana?.idPersoana || null
                    });

                    if (data.politist) setInitialPolitistName(`${data.politist.nume} ${data.politist.prenume} (${data.politist.grad})`);
                    if (data.persoana) setInitialPersoanaName(`${data.persoana.nume} ${data.persoana.prenume} (CNP: ${data.persoana.cnp})`);
                })
                .catch(err => console.error("Eroare incarcare amenda:", err));
        }
    }, [id]);

    const handleSave = () => {
        const token = localStorage.getItem('token');
        const sumaNumar = formData.suma ? parseFloat(formData.suma) : null;

        const payload = {
            motiv: formData.motiv,
            suma: sumaNumar,
            starePlata: formData.starePlata,
            dataEmitere: formData.dataEmitere,
            idPolitist: formData.politistId,
            idPersoana: formData.persoanaId
        };

        axios.put(`http://localhost:8080/api/amenzi/${id}`, payload, {
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
                    alert("Eroare la modificare!");
                }
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

                <label>Data Acordării</label>
                <input
                    type="datetime-local" className="modal-input"
                    value={formData.dataEmitere}
                    onChange={(e) => setFormData({...formData, dataEmitere: e.target.value})}
                />
                {errors.dataEmitere && <span style={{color: 'red', fontSize: '12px'}}>{errors.dataEmitere}</span>}

                <LiveSearchInput
                    label="Agent Constatator"
                    apiUrl="http://localhost:8080/api/politisti/cauta"
                    defaultValue={initialPolitistName}
                    displayKey={(p) => `${p.nume} ${p.prenume} (${p.grad})`}
                    onSelect={(item) => setFormData({...formData, politistId: item?.idPolitist})}
                />

                <LiveSearchInput
                    label="Persoana Amendată"
                    apiUrl="http://localhost:8080/api/persoane/cauta"
                    defaultValue={initialPersoanaName}
                    displayKey={(p) => `${p.nume} ${p.prenume} (CNP: ${p.cnp})`}
                    onSelect={(item) => setFormData({...formData, persoanaId: item?.idPersoana})}
                />
            </div>
            <div className="modal-footer">
                <button className="save-btn" onClick={handleSave}>Salvează Modificări</button>
            </div>
        </div>
    );
};

export default EditAmenda;