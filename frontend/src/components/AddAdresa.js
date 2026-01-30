/**
 * Component for adding a new address to the database.
 * @author Ivan Vlad-Daniel
 * @version January 11, 2026
 */
import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './styles/Forms.css';

const AddAdresa = ({ onSaveSuccess, onCancel }) => {
    // I initialize the form state with empty strings to ensure controlled inputs.
    const [formData, setFormData] = useState({
        strada: '', numar: '', bloc: '', apartament: '', localitate: '', judetSauSector: ''
    });
    const [errors, setErrors] = useState({});

    // I update the state as the user types and clear specific errors to improve UX.
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // If the user starts correcting a field, I remove the validation error immediately.
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    // I handle the data submission to the backend API.
    const handleSave = () => {
        setErrors({}); // I reset global errors before a new attempt.

        axios.post('http://localhost:8080/api/adrese', formData)
            .then((response) => {
                toast.success("Adresă înregistrată!");
                // I trigger the callback to notify the parent component and close the modal.
                onSaveSuccess(response.data.idAdresa);
            })
            .catch(err => {
                if (err.response?.status === 400) {
                    // I map backend validation errors to the frontend state to display them under inputs.
                    setErrors(err.response.data);
                    toast.error("Verifică câmpurile invalide!");
                } else {
                    toast.error("Eroare la salvare!");
                }
            });
    };

    // Helper function to render input fields with consistent styling and error handling.
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
                    {/* I allow users to quickly clear the field if it contains text. */}
                    {formData[name] && (
                        <button type="button" className="search-clear-btn-gold" onClick={() => setFormData({...formData, [name]: ''})}>
                            <i className="fa-solid fa-circle-xmark"></i>
                        </button>
                    )}
                </div>
                {/* I display the specific error message returned from the Java backend. */}
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