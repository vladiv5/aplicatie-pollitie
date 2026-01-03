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
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (id) {
            const token = localStorage.getItem('token');
            axios.get(`http://localhost:8080/api/persoane/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(response => {
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
                setErrors({});
                onSaveSuccess();
            })
            .catch(error => {
                if (error.response && error.response.status === 400) {
                    setErrors(error.response.data);
                } else {
                    alert("Eroare server!");
                }
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
                {errors.nume && <span style={{color: 'red', fontSize: '12px'}}>{errors.nume}</span>}

                <label>Prenume</label>
                <input
                    type="text" name="prenume" className="modal-input"
                    value={formData.prenume} onChange={handleChange}
                />
                {errors.prenume && <span style={{color: 'red', fontSize: '12px'}}>{errors.prenume}</span>}

                <label>CNP</label>
                <input
                    type="text" name="cnp" className="modal-input" maxLength="13"
                    value={formData.cnp} onChange={handleChange}
                />
                {errors.cnp && <span style={{color: 'red', fontSize: '12px'}}>{errors.cnp}</span>}

                <label>Data Nașterii</label>
                <input
                    type="date" name="dataNasterii" className="modal-input"
                    value={formData.dataNasterii || ''} onChange={handleChange}
                />
                {errors.dataNasterii && <span style={{color: 'red', fontSize: '12px'}}>{errors.dataNasterii}</span>}

                <label>Telefon</label>
                <input
                    type="text" name="telefon" className="modal-input"
                    value={formData.telefon} onChange={handleChange}
                />
                {errors.telefon && <span style={{color: 'red', fontSize: '12px'}}>{errors.telefon}</span>}
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