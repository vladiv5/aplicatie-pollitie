import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/TableStyles.css';

const EditAdresa = ({ id, onSaveSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        strada: '',
        numar: '',
        bloc: '',
        apartament: '',
        localitate: '',
        judetSauSector: ''
    });

    // Încărcăm datele existente când se deschide modalul
    useEffect(() => {
        if (id) {
            const token = localStorage.getItem('token');
            axios.get(`http://localhost:8080/api/adrese/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => {
                    const data = res.data;
                    setFormData({
                        strada: data.strada || '',
                        numar: data.numar || '',
                        bloc: data.bloc || '',
                        apartament: data.apartament || '',
                        localitate: data.localitate || '',
                        judetSauSector: data.judetSauSector || ''
                    });
                })
                .catch(err => console.error("Eroare încărcare adresă:", err));
        }
    }, [id]);

    const handleSave = () => {
        if(!formData.strada || !formData.localitate || !formData.judetSauSector) {
            alert("Strada, Localitatea și Județul sunt obligatorii!");
            return;
        }

        const token = localStorage.getItem('token');

        // Facem PUT în loc de POST
        axios.put(`http://localhost:8080/api/adrese/${id}`, formData, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(() => {
                onSaveSuccess();
            })
            .catch(err => {
                console.error("Eroare update:", err);
                alert("Eroare la modificare!");
            });
    };

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    return (
        <div>
            <div className="form-group">
                <label>Județ / Sector</label>
                <input
                    name="judetSauSector"
                    className="modal-input"
                    value={formData.judetSauSector}
                    onChange={handleChange}
                />

                <label>Localitate</label>
                <input
                    name="localitate"
                    className="modal-input"
                    value={formData.localitate}
                    onChange={handleChange}
                />

                <label>Stradă</label>
                <input
                    name="strada"
                    className="modal-input"
                    value={formData.strada}
                    onChange={handleChange}
                />

                <div style={{display:'flex', gap:'10px'}}>
                    <div style={{width:'30%'}}>
                        <label>Nr.</label>
                        <input
                            name="numar"
                            className="modal-input"
                            value={formData.numar}
                            onChange={handleChange}
                        />
                    </div>
                    <div style={{width:'30%'}}>
                        <label>Bloc</label>
                        <input
                            name="bloc"
                            className="modal-input"
                            value={formData.bloc}
                            onChange={handleChange}
                        />
                    </div>
                    <div style={{width:'30%'}}>
                        <label>Ap.</label>
                        <input
                            name="apartament"
                            className="modal-input"
                            value={formData.apartament}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>

            <div className="modal-footer">
                <button className="save-btn" onClick={handleSave}>
                    Salvează Modificări
                </button>
            </div>
        </div>
    );
};

export default EditAdresa;