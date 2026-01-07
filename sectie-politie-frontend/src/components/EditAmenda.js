import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LiveSearchInput from './LiveSearchInput';
import toast from 'react-hot-toast';
import './styles/Forms.css'; // IMPORTĂM NOILE STILURI

const EditAmenda = ({ id, onSaveSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        motiv: '',
        suma: '',
        starePlata: 'Neplatita',
        dataEmitere: '',
        politistId: null,
        persoanaId: null
    });
    const [errors, setErrors] = useState({});
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
                .catch(err => toast.error("Eroare la încărcare amendă."));
        }
    }, [id]);

    const handleClear = (fieldName) => {
        setFormData({ ...formData, [fieldName]: '' });
    };

    const handleChange = (fieldName, value) => {
        setFormData({ ...formData, [fieldName]: value });
        if (errors[fieldName]) {
            setErrors({ ...errors, [fieldName]: null });
        }
    };

    const handleSave = () => {
        const token = localStorage.getItem('token');
        setErrors({});

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
            .then((response) => {
                const updatedId = response.data ? response.data.idAmenda : id;
                setErrors({});
                toast.success("Amendă actualizată!");
                onSaveSuccess(updatedId);
            })
            .catch(error => {
                if (error.response && error.response.status === 400) {
                    setErrors(error.response.data);
                } else {
                    toast.error("Eroare la modificare!");
                }
            });
    };

    const renderInput = (label, name, type = 'text') => (
        <div style={{ position: 'relative' }}>
            <label className="form-label">{label}</label>
            <div style={{ position: 'relative' }}>
                <input
                    type={type}
                    className={`modal-input ${errors[name] ? 'input-error' : ''}`}
                    value={formData[name]}
                    onChange={(e) => handleChange(name, e.target.value)}
                />

                {formData[name] && type !== 'datetime-local' && (
                    <span
                        className="clear-icon"
                        onClick={() => handleClear(name)}
                        title="Șterge"
                    >
                        &times;
                    </span>
                )}
            </div>
            {errors[name] && (
                <span className="error-text">{errors[name]}</span>
            )}
        </div>
    );

    return (
        <div>
            <div className="form-group">
                {renderInput("Motiv", "motiv")}
                {renderInput("Sumă (RON)", "suma", "number")}

                <div style={{ position: 'relative' }}>
                    <label className="form-label">Stare Plată</label>
                    <select
                        className="modal-input"
                        value={formData.starePlata}
                        onChange={(e) => handleChange('starePlata', e.target.value)}
                    >
                        <option value="Neplatita">Neplatita</option>
                        <option value="Platita">Platita</option>
                        <option value="Anulata">Anulata</option>
                    </select>
                </div>

                {renderInput("Data Acordării", "dataEmitere", "datetime-local")}

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
                <button className="save-btn" onClick={handleSave}>SALVAȚI MODIFICĂRI</button>
            </div>
        </div>
    );
};

export default EditAmenda;