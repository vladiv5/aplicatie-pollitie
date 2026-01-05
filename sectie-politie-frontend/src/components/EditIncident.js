import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LiveSearchInput from './LiveSearchInput';
import './styles/TableStyles.css';
import toast from 'react-hot-toast'; // <--- IMPORT

const EditIncident = ({ id, onSaveSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        tipIncident: '',
        status: 'Activ',
        dataEmitere: '',
        descriereLocatie: '',
        descriereIncident: '',
        politistId: null,
        adresaId: null
    });

    const [initialPolitistName, setInitialPolitistName] = useState('');
    const [initialAdresaName, setInitialAdresaName] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (id) {
            const token = localStorage.getItem('token');
            axios.get(`http://localhost:8080/api/incidente/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(response => {
                    const data = response.data;
                    setFormData({
                        tipIncident: data.tipIncident || '',
                        status: data.status || 'Activ',
                        dataEmitere: data.dataEmitere || '',
                        descriereLocatie: data.descriereLocatie || '',
                        descriereIncident: data.descriereIncident || '',
                        politistId: data.politistResponsabil?.idPolitist || null,
                        adresaId: data.adresaIncident?.idAdresa || null
                    });

                    if (data.politistResponsabil) {
                        setInitialPolitistName(`${data.politistResponsabil.nume} ${data.politistResponsabil.prenume} (${data.politistResponsabil.grad})`);
                    }
                    if (data.adresaIncident) {
                        setInitialAdresaName(`${data.adresaIncident.strada} Nr. ${data.adresaIncident.numar}, ${data.adresaIncident.localitate}`);
                    }
                })
                .catch(error => toast.error("Eroare la încărcarea datelor!"));
        }
    }, [id]);

    const handleSave = () => {
        const token = localStorage.getItem('token');

        const payload = {
            tipIncident: formData.tipIncident,
            status: formData.status,
            dataEmitere: formData.dataEmitere,
            descriereLocatie: formData.descriereLocatie,
            descriereIncident: formData.descriereIncident,
            idPolitist: formData.politistId,
            idAdresa: formData.adresaId
        };

        axios.put(`http://localhost:8080/api/incidente/${id}`, payload, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then((response) => {
                // MODIFICARE AICI:
                const updatedId = response.data ? response.data.idIncident : id;

                setErrors({});
                toast.success("Incident actualizat cu succes!");
                onSaveSuccess(updatedId); // Trimitem ID-ul
            })
            .catch(error => {
                if (error.response && error.response.status === 400) {
                    setErrors(error.response.data);
                    toast.error("Verifică câmpurile invalide!");
                } else {
                    toast.error("Eroare la modificare!"); // <--- TOAST
                }
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
                {errors.tipIncident && <span style={{color: 'red', fontSize: '12px'}}>{errors.tipIncident}</span>}

                <label>Stare Incident</label>
                <select
                    className="modal-input"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    style={{fontWeight: 'bold', color: formData.status === 'Activ' ? 'green' : formData.status === 'Închis' ? 'gray' : 'orange'}}
                >
                    <option value="Activ">Activ</option>
                    <option value="Închis">Închis</option>
                    <option value="Arhivat">Arhivat</option>
                </select>

                <label>Data și Ora</label>
                <input
                    type="datetime-local" className="modal-input"
                    value={formData.dataEmitere}
                    onChange={(e) => setFormData({...formData, dataEmitere: e.target.value})}
                />
                {errors.dataEmitere && <span style={{color: 'red', fontSize: '12px'}}>{errors.dataEmitere}</span>}

                <LiveSearchInput
                    label="Polițist Responsabil"
                    apiUrl="http://localhost:8080/api/politisti/cauta"
                    defaultValue={initialPolitistName}
                    displayKey={(p) => `${p.nume} ${p.prenume} (${p.grad})`}
                    onSelect={(item) => setFormData({...formData, politistId: item ? item.idPolitist : null})}
                />

                <LiveSearchInput
                    label="Adresă Incident"
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
                {errors.descriereLocatie && <span style={{color: 'red', fontSize: '12px'}}>{errors.descriereLocatie}</span>}

                <label>Detalii Incident</label>
                <textarea
                    className="modal-input" rows="3"
                    value={formData.descriereIncident}
                    onChange={(e) => setFormData({...formData, descriereIncident: e.target.value})}
                />
            </div>

            <div className="modal-footer">
                <button className="save-btn" onClick={handleSave}>Salvați Modificări</button>
            </div>
        </div>
    );
};

export default EditIncident;