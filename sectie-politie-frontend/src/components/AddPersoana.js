import React, { useState } from 'react';
import axios from 'axios';
import './styles/TableStyles.css';

const AddPersoana = ({ onSaveSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        nume: '',
        prenume: '',
        cnp: '',
        dataNasterii: '',
        telefon: ''
    });
    // State pentru erorile venite din Backend
    const [errors, setErrors] = useState({});

    const handleSave = () => {
        // --- AM SCOS IF-ul CARE BLOCA TRIMIEREA ---
        // Acum datele pleacă direct la Java, chiar dacă sunt goale.
        // Java va întoarce erorile (400 Bad Request), iar noi le vom afișa sub câmpuri.

        const token = localStorage.getItem('token');

        axios.post('http://localhost:8080/api/persoane', formData, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(() => {
                setErrors({});
                onSaveSuccess();
            })
            .catch(error => {
                if (error.response && error.response.status === 400) {
                    // Aici primim harta cu erori (ex: "Numele este obligatoriu", "CNP invalid")
                    setErrors(error.response.data);
                } else {
                    console.error(error);
                    alert("Eroare server! Verifică consola.");
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
                {/* Mesaj de eroare sub camp */}
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
                    Salvează Persoana
                </button>
            </div>
        </div>
    );
};

export default AddPersoana;