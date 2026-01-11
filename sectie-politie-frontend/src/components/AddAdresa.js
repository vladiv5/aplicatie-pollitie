/** Componenta pentru adaugarea unei noi adrese in baza de date
 * @author Ivan Vlad-Daniel
 * @version 11 ianuarie 2026
 */
import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './styles/Forms.css';

const AddAdresa = ({ onSaveSuccess, onCancel }) => {
    // Initializarea starii formularului cu campuri goale
    const [formData, setFormData] = useState({
        strada: '', numar: '', bloc: '', apartament: '', localitate: '', judetSauSector: ''
    });
    const [errors, setErrors] = useState({});

    // Functie pentru actualizarea starii cand utilizatorul scrie in input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Daca exista o eroare pe acest camp, o sterg cand utilizatorul incepe sa corecteze
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    // Trimiterea datelor catre server
    const handleSave = () => {
        setErrors({}); // Resetez erorile anterioare

        axios.post('http://localhost:8080/api/adrese', formData)
            .then((response) => {
                toast.success("Adresă înregistrată!");
                // Apelez functia de callback pentru a notifica parintele si a inchide modalul
                onSaveSuccess(response.data.idAdresa);
            })
            .catch(err => {
                if (err.response?.status === 400) {
                    // Daca primesc erori de validare de la backend, le afisez sub campuri
                    setErrors(err.response.data);
                    toast.error("Verifică câmpurile invalide!");
                } else {
                    toast.error("Eroare la salvare!");
                }
            });
    };

    // Helper pentru randarea input-urilor cu stiluri consistente
    const renderInput = (name, label, placeholder, icon, containerStyle = {}) => {
        const hasError = errors[name];
        return (
            <div className="form-group-item" style={containerStyle}>
                <label className="form-label">
                    <i className={`fa-solid ${icon}`} style={{marginRight: '8px', color: '#d4af37'}}></i>
                    {label}
                </label>
                <div className="input-wrapper">
                    <input
                        name={name}
                        placeholder={placeholder}
                        className={`modal-input ${hasError ? 'input-error' : ''}`}
                        value={formData[name]}
                        onChange={handleChange}
                    />
                    {/* Butonul de stergere rapida (X) apare doar daca exista text */}
                    {formData[name] && (
                        <button type="button" className="search-clear-btn-gold" onClick={() => setFormData({...formData, [name]: ''})}>
                            <i className="fa-solid fa-circle-xmark"></i>
                        </button>
                    )}
                </div>
                {/* Mesajul de eroare venit din backend */}
                {hasError && <span className="error-text">{errors[name]}</span>}
            </div>
        );
    };

    return (
        <div className="modal-body-scroll">
            <div className="form-grid-stack">
                {renderInput("judetSauSector", "Județ / Sector", "ex: București", "fa-map")}
                {renderInput("localitate", "Localitate", "ex: București", "fa-city")}
                {renderInput("strada", "Stradă", "ex: Calea Victoriei", "fa-road")}

                <div style={{display:'flex', gap:'10px'}}>
                    {renderInput("numar", "Nr.", "ex: 12", "fa-house-chimney", { width: '33%' })}
                    {renderInput("bloc", "Bloc", "ex: M3", "fa-building", { width: '33%' })}
                    {renderInput("apartament", "Ap.", "ex: 5", "fa-door-open", { width: '33%' })}
                </div>
            </div>
            <div className="modal-footer" style={{marginTop: '30px'}}>
                <button className="save-btn" onClick={handleSave}>
                    <i className="fa-solid fa-floppy-disk" style={{marginRight: '8px'}}></i>
                    SALVAȚI ADRESA
                </button>
            </div>
        </div>
    );
};

export default AddAdresa;