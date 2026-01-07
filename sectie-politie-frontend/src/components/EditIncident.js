import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LiveSearchInput from './LiveSearchInput';
import toast from 'react-hot-toast';
import './styles/Forms.css'; // IMPORTĂM NOILE STILURI

const EditIncident = ({ id, onSaveSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        tipIncident: '', status: 'Activ', dataEmitere: '',
        descriereLocatie: '', descriereIncident: '',
        politistId: null, adresaId: null
    });
    const [initialNames, setInitialNames] = useState({ politist: '', adresa: '' });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (id) {
            axios.get(`http://localhost:8080/api/incidente/${id}`)
                .then(res => {
                    const d = res.data;
                    setFormData({
                        tipIncident: d.tipIncident || '',
                        status: d.status || 'Activ',
                        dataEmitere: d.dataEmitere || '',
                        descriereLocatie: d.descriereLocatie || '',
                        descriereIncident: d.descriereIncident || '',
                        politistId: d.politistResponsabil?.idPolitist || null,
                        adresaId: d.adresaIncident?.idAdresa || null
                    });
                    setInitialNames({
                        politist: d.politistResponsabil ? `${d.politistResponsabil.nume} ${d.politistResponsabil.prenume}` : '',
                        adresa: d.adresaIncident ? `${d.adresaIncident.strada} Nr. ${d.adresaIncident.numar}` : ''
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
        axios.put(`http://localhost:8080/api/incidente/${id}`, { ...formData, idPolitist: formData.politistId, idAdresa: formData.adresaId })
            .then(() => {
                toast.success("Incident actualizat!");
                onSaveSuccess(id);
            })
            .catch(err => {
                if (err.response?.status === 400) setErrors(err.response.data);
                toast.error("Verifică câmpurile invalide!");
            });
    };

    const renderInput = (label, name, icon, type = 'text', Component = 'input') => (
        <div className="form-group-item">
            <label className="form-label"><i className={`fa-solid ${icon}`} style={{marginRight: '8px', color: '#d4af37'}}></i>{label}</label>
            <div className="input-wrapper">
                <Component
                    type={type}
                    className={`modal-input ${errors[name] ? 'input-error' : ''}`}
                    value={formData[name]}
                    onChange={(e) => handleChange(name, e.target.value)}
                    rows={Component === 'textarea' ? 3 : undefined}
                />
                {formData[name] && type !== 'datetime-local' && (
                    <button type="button" className="search-clear-btn-gold" onClick={() => handleChange(name, '')}><i className="fa-solid fa-circle-xmark"></i></button>
                )}
            </div>
            {errors[name] && <span className="error-text">{errors[name]}</span>}
        </div>
    );

    return (
        <div className="modal-body-scroll">
            <div className="form-grid-stack">
                {renderInput("Tip Incident", "tipIncident", "fa-triangle-exclamation")}
                {/* ... restul campurilor similare cu AddIncident ... */}
                {renderInput("Detalii Incident", "descriereIncident", "fa-file-lines", "text", "textarea")}
            </div>
            <div className="modal-footer" style={{marginTop: '30px'}}>
                <button className="save-btn" onClick={handleSave}>
                    <i className="fa-solid fa-pen-to-square" style={{marginRight: '8px'}}></i>SALVAȚI MODIFICĂRI
                </button>
            </div>
        </div>
    );
};

export default EditIncident;