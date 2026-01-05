import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const EditPolitist = ({ id, onSaveSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        nume: '', prenume: '', grad: '', functie: '', telefon_serviciu: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (id) {
            axios.get(`http://localhost:8080/api/politisti/${id}`)
                .then(res => setFormData(res.data))
                .catch(err => console.error("Eroare:", err));
        }
    }, [id]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // --- FUNCȚIE NOUĂ: ȘTERGERE CÂMP ---
    const handleClear = (fieldName) => {
        setFormData({ ...formData, [fieldName]: '' });
    };

    const handleSubmit = () => {
        axios.put(`http://localhost:8080/api/politisti/${id}`, formData)
            .then((response) => {
                toast.success("Polițist actualizat!");
                const savedId = response.data ? response.data.idPolitist : id;
                onSaveSuccess(savedId);
            })
            .catch(error => {
                if (error.response && error.response.status === 400) {
                    setErrors(error.response.data);
                    toast.error("Verifică câmpurile invalide!");
                } else {
                    console.error("Eroare:", error);
                    toast.error("A apărut o eroare la salvare!");
                }
            });
    };

    // --- HELPER PENTRU INPUT CU X ---
    // Aici includem și Label-ul
    const renderInput = (label, name) => (
        <div style={{ marginBottom: '15px' }}>
            <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>{label}</label>
            <div style={{ position: 'relative' }}>
                <input
                    type="text"
                    name={name}
                    className="modal-input"
                    value={formData[name] || ''}
                    onChange={handleChange}
                    style={{ paddingRight: '30px' }} // Loc pentru X
                />
                {formData[name] && (
                    <span
                        onClick={() => handleClear(name)}
                        style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            cursor: 'pointer',
                            color: '#999',
                            fontWeight: 'bold',
                            fontSize: '18px',
                            userSelect: 'none'
                        }}
                        title="Șterge"
                    >
                        &times;
                    </span>
                )}
            </div>
            {errors[name] && <span style={{ color: 'red', fontSize: '12px', display:'block', marginTop:'2px' }}>{errors[name]}</span>}
        </div>
    );

    return (
        <div>
            <div className="form-group">
                {renderInput("Nume", "nume")}
                {renderInput("Prenume", "prenume")}
                {renderInput("Grad", "grad")}
                {renderInput("Funcție", "functie")}
                {renderInput("Telefon", "telefon_serviciu")}
            </div>
            <div className="modal-footer">
                <button className="save-btn" onClick={handleSubmit}>Salvați Modificări</button>
            </div>
        </div>
    );
};

export default EditPolitist;