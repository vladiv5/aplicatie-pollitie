import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/TableStyles.css';

const EditPersoana = ({ id, onSaveSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        nume: '',
        prenume: '',
        cnp: '',
        dataNasterii: '',
        telefon: ''
    });

    useEffect(() => {
        if (id) {
            const token = localStorage.getItem('token');
            axios.get(`http://localhost:8080/api/persoane/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(response => {
                    // Backend-ul trimite data in format YYYY-MM-DD, exact ce trebuie.
                    // Nu mai e nevoie de procesare suplimentara.
                    setFormData(response.data);
                })
                .catch(error => console.error("Eroare la încărcare date persoană:", error));
        }
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        const token = localStorage.getItem('token');

        axios.put(`http://localhost:8080/api/persoane/${id}`, formData, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(() => {
                onSaveSuccess();
            })
            .catch(error => {
                console.error("Eroare la update:", error);
                alert("Eroare la modificare! Verifică datele.");
            });
    };

    return (
        <div>
            <div className="form-group">
                <label>Nume</label>
                <input
                    type="text" name="nume" className="modal-input"
                    value={formData.nume} onChange={handleChange}
                />

                <label>Prenume</label>
                <input
                    type="text" name="prenume" className="modal-input"
                    value={formData.prenume} onChange={handleChange}
                />

                <label>CNP</label>
                <input
                    type="text" name="cnp" className="modal-input" maxLength="13"
                    value={formData.cnp} onChange={handleChange}
                />

                <label>Data Nașterii</label>
                <input
                    type="date" name="dataNasterii" className="modal-input"
                    value={formData.dataNasterii || ''} onChange={handleChange}
                />

                <label>Telefon</label>
                <input
                    type="text" name="telefon" className="modal-input"
                    value={formData.telefon} onChange={handleChange}
                />
            </div>

            <div className="modal-footer">
                <button className="save-btn" onClick={handleSave}>
                    Salvează Modificări
                </button>
            </div>
        </div>
    );
};

export default EditPersoana;