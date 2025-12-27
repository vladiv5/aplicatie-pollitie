import React, { useState } from 'react';
import axios from 'axios';
import './styles/TableStyles.css';

const AddAdresa = ({ onSaveSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        strada: '',
        numar: '',
        bloc: '',
        apartament: '',
        localitate: '',
        judetSauSector: ''
    });

    const handleSave = () => {
        // Validare minimă
        if(!formData.strada || !formData.localitate || !formData.judetSauSector) {
            alert("Strada, Localitatea și Județul sunt obligatorii!");
            return;
        }

        const token = localStorage.getItem('token');

        axios.post('http://localhost:8080/api/adrese', formData, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(() => {
                onSaveSuccess();
            })
            .catch(err => {
                console.error("Eroare salvare:", err);
                alert("Eroare la salvare! Verifică consola.");
            });
    };

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    return (
        <div>
            <div className="form-group">
                <input
                    name="judetSauSector"
                    placeholder="Județ / Sector"
                    className="modal-input"
                    value={formData.judetSauSector}
                    onChange={handleChange}
                />

                <input
                    name="localitate"
                    placeholder="Localitate"
                    className="modal-input"
                    value={formData.localitate}
                    onChange={handleChange}
                />

                <input
                    name="strada"
                    placeholder="Stradă"
                    className="modal-input"
                    value={formData.strada}
                    onChange={handleChange}
                />

                <div style={{display:'flex', gap:'10px'}}>
                    <input
                        name="numar"
                        placeholder="Nr."
                        className="modal-input"
                        style={{width:'30%'}}
                        value={formData.numar}
                        onChange={handleChange}
                    />
                    <input
                        name="bloc"
                        placeholder="Bloc"
                        className="modal-input"
                        style={{width:'30%'}}
                        value={formData.bloc}
                        onChange={handleChange}
                    />
                    <input
                        name="apartament"
                        placeholder="Ap."
                        className="modal-input"
                        style={{width:'30%'}}
                        value={formData.apartament}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="modal-footer">
                <button className="save-btn" onClick={handleSave}>
                    Salvează Adresa
                </button>
            </div>
        </div>
    );
};

export default AddAdresa;