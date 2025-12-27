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

    const handleSave = () => {
        // Validare simplă
        if (!formData.nume || !formData.cnp) {
            alert("Numele și CNP-ul sunt obligatorii!");
            return;
        }

        const token = localStorage.getItem('token');

        axios.post('http://localhost:8080/api/persoane', formData, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(() => {
                onSaveSuccess();
            })
            .catch(error => {
                console.error("Eroare salvare:", error);
                alert("Eroare la salvare! Verifică CNP-ul (trebuie să fie unic) sau conexiunea.");
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
                <input
                    type="text" name="prenume" placeholder="Prenume"
                    className="modal-input" onChange={handleChange} value={formData.prenume}
                />
                <input
                    type="text" name="cnp" placeholder="CNP" maxLength="13"
                    className="modal-input" onChange={handleChange} value={formData.cnp}
                />

                {/* Data Nașterii */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '12px', color: '#666', marginLeft: '2px' }}>Data Nașterii:</label>
                    <input
                        type="date" name="dataNasterii"
                        className="modal-input" onChange={handleChange} value={formData.dataNasterii}
                    />
                </div>

                <input
                    type="text" name="telefon" placeholder="Telefon"
                    className="modal-input" onChange={handleChange} value={formData.telefon}
                />
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