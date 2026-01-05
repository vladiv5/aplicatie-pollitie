import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const EditPolitist = ({ id, onSaveSuccess, onCancel }) => {
    // ... (state și useEffect rămân la fel) ...
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

    const handleSubmit = () => {
        axios.put(`http://localhost:8080/api/politisti/${id}`, formData)
            .then((response) => {
                toast.success("Polițist actualizat!");
                // Trimitem ID-ul către părinte (chiar dacă îl știm deja, e standard)
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

    return (
        <div>
            {/* ... (JSX-ul rămâne identic) ... */}
            <div className="form-group">
                <label>Nume</label>
                <input type="text" name="nume" className="modal-input" value={formData.nume} onChange={handleChange} />
                {errors.nume && <span style={{color: 'red', fontSize: '12px'}}>{errors.nume}</span>}
                {/* ... restul inputurilor ... */}
                <label>Prenume</label>
                <input type="text" name="prenume" className="modal-input" value={formData.prenume} onChange={handleChange} />

                <label>Grad</label>
                <input type="text" name="grad" className="modal-input" value={formData.grad} onChange={handleChange} />

                <label>Funcție</label>
                <input type="text" name="functie" className="modal-input" value={formData.functie} onChange={handleChange} />

                <label>Telefon</label>
                <input type="text" name="telefon_serviciu" className="modal-input" value={formData.telefon_serviciu} onChange={handleChange} />
            </div>
            <div className="modal-footer">
                <button className="save-btn" onClick={handleSubmit}>Salvați Modificări</button>
            </div>
        </div>
    );
};

export default EditPolitist;