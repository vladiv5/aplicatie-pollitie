import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast'; // <--- IMPORT

import './styles/TableStyles.css';

const AddPersoana = ({ onSaveSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        nume: '',
        prenume: '',
        cnp: '',
        dataNasterii: '',
        telefon: ''
    });
    const [errors, setErrors] = useState({});

    const handleSave = () => {
        const token = localStorage.getItem('token');

        axios.post('http://localhost:8080/api/persoane', formData, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then((response) => {
                // MODIFICARE AICI: Extragem ID-ul
                const newId = response.data ? response.data.idPersoana : null;

                setErrors({});
                toast.success("Persoană adăugată cu succes!");
                onSaveSuccess(newId); // Trimitem ID-ul
            })
            .catch(error => {
                // ... erori ...
                if (error.response && error.response.status === 400) {
                    setErrors(error.response.data);
                    toast.error("Verifică câmpurile invalide!");
                } else {
                    console.error(error);
                    toast.error("Eroare la salvare!");
                }
            });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div>
            <div className="form-group">
                <input
                    type="text" name="nume" placeholder="Nume"
                    className="modal-input" onChange={handleChange} value={formData.nume}
                />
                {errors.nume && <span style={{color: 'red', fontSize: '12px'}}>{errors.nume}</span>}

                <input
                    type="text" name="prenume" placeholder="Prenume"
                    className="modal-input" onChange={handleChange} value={formData.prenume}
                />
                {errors.prenume && <span style={{color: 'red', fontSize: '12px'}}>{errors.prenume}</span>}

                <input
                    type="text" name="cnp" placeholder="CNP" maxLength="13"
                    className="modal-input" onChange={handleChange} value={formData.cnp}
                />
                {errors.cnp && <span style={{color: 'red', fontSize: '12px'}}>{errors.cnp}</span>}

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '12px', color: '#666', marginLeft: '2px' }}>Data Nașterii:</label>
                    <input
                        type="date" name="dataNasterii"
                        className="modal-input" onChange={handleChange} value={formData.dataNasterii}
                    />
                    {errors.dataNasterii && <span style={{color: 'red', fontSize: '12px'}}>{errors.dataNasterii}</span>}
                </div>

                <input
                    type="text" name="telefon" placeholder="Telefon"
                    className="modal-input" onChange={handleChange} value={formData.telefon}
                />
                {errors.telefon && <span style={{color: 'red', fontSize: '12px'}}>{errors.telefon}</span>}
            </div>

            <div className="modal-footer">
                <button className="save-btn" onClick={handleSave}>
                    Salvați Persoana
                </button>
            </div>
        </div>
    );
};

export default AddPersoana;