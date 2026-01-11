/** Componenta pentru modificarea unei amenzi existente
 * @author Ivan Vlad-Daniel
 * @version 11 ianuarie 2026
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LiveSearchInput from './LiveSearchInput';
import toast from 'react-hot-toast';
import './styles/Forms.css';

const EditAmenda = ({ id, onSaveSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        motiv: '', suma: '', starePlata: 'Neplatita',
        dataEmitere: '', politistId: null, persoanaId: null
    });
    const [initialNames, setInitialNames] = useState({ politist: '', persoana: '' });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (id) {
            axios.get(`http://localhost:8080/api/amenzi/${id}`)
                .then(res => {
                    const d = res.data;
                    setFormData({
                        motiv: d.motiv || '',
                        suma: d.suma || '',
                        starePlata: d.starePlata || 'Neplatita',
                        dataEmitere: d.dataEmitere || '',
                        politistId: d.politist?.idPolitist || null,
                        persoanaId: d.persoana?.idPersoana || null
                    });
                    setInitialNames({
                        politist: d.politist ? `${d.politist.nume} ${d.politist.prenume} (${d.politist.grad})` : '',
                        persoana: d.persoana ? `${d.persoana.nume} ${d.persoana.prenume} (CNP: ${d.persoana.cnp})` : ''
                    });
                });
        }
    }, [id]);

    const handleChange = (name, val) => {
        setFormData(prev => ({ ...prev, [name]: val }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleSave = () => {
        setErrors({});
        axios.put(`http://localhost:8080/api/amenzi/${id}`, {
            ...formData,
            idPolitist: formData.politistId,
            idPersoana: formData.persoanaId,
            suma: formData.suma ? parseFloat(formData.suma) : null
        })
            .then(() => {
                toast.success("Amendă actualizată!");
                onSaveSuccess(id);
            })
            .catch(err => {
                if (err.response?.status === 400) {
                    setErrors(err.response.data);
                    toast.error("Verifică câmpurile invalide!");
                } else {
                    toast.error("Eroare la modificare!");
                }
            });
    };

    const renderInput = (label, name, icon, type = 'text') => {
        const hasError = errors[name];
        return (
            <div className="form-group-item">
                <label className="form-label"><i className={`fa-solid ${icon}`} style={{marginRight: '8px', color: '#d4af37'}}></i>{label}</label>
                <div className="input-wrapper">
                    <input
                        type={type}
                        className={`modal-input ${hasError ? 'input-error' : ''}`}
                        value={formData[name]}
                        onChange={(e) => handleChange(name, e.target.value)}
                    />
                    {formData[name] && type !== 'datetime-local' && (
                        <button type="button" className="search-clear-btn-gold" onClick={() => handleChange(name, '')}><i className="fa-solid fa-circle-xmark"></i></button>
                    )}
                </div>
                {hasError && <span className="error-text">{errors[name]}</span>}
            </div>
        );
    };

    return (
        <div className="modal-body-scroll">
            <div className="form-grid-stack">
                {renderInput("Motiv Amendă", "motiv", "fa-file-signature")}
                {renderInput("Sumă (RON)", "suma", "fa-coins", "number")}

                <div className="form-group-item">
                    <label className="form-label"><i className="fa-solid fa-hand-holding-dollar" style={{marginRight: '8px', color: '#d4af37'}}></i>Stare Plată</label>
                    <select className="modal-input" value={formData.starePlata} onChange={(e) => handleChange('starePlata', e.target.value)}>
                        <option value="Neplatita">Neplatita</option>
                        <option value="Platita">Platita</option>
                        <option value="Anulata">Anulata</option>
                    </select>
                </div>

                {renderInput("Data Acordării", "dataEmitere", "fa-calendar-day", "datetime-local")}

                <div className="form-group-item">
                    <LiveSearchInput
                        label="Agent Constatator"
                        apiUrl="http://localhost:8080/api/politisti/cauta"
                        icon="fa-user-shield"
                        defaultValue={initialNames.politist}
                        displayKey={(p) => `${p.nume} ${p.prenume} (${p.grad})`}
                        onSelect={(item) => handleChange('politistId', item?.idPolitist)}
                        error={errors.idPolitist}
                    />
                </div>

                <div className="form-group-item">
                    <LiveSearchInput
                        label="Persoana Amendată"
                        apiUrl="http://localhost:8080/api/persoane/cauta"
                        icon="fa-user-tag"
                        defaultValue={initialNames.persoana}
                        displayKey={(p) => `${p.nume} ${p.prenume} (CNP: ${p.cnp})`}
                        onSelect={(item) => handleChange('persoanaId', item?.idPersoana)}
                        error={errors.idPersoana}
                    />
                </div>
            </div>
            <div className="modal-footer" style={{marginTop: '30px'}}>
                <button className="save-btn" onClick={handleSave}>
                    <i className="fa-solid fa-pen-to-square" style={{marginRight: '8px'}}></i>
                    SALVAȚI MODIFICĂRI
                </button>
            </div>
        </div>
    );
};

export default EditAmenda;