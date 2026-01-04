import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast'; // <--- IMPORT

const EditPolitist = ({ id, onSaveSuccess, onCancel }) => {

    const [formData, setFormData] = useState({
        nume: '',
        prenume: '',
        grad: '',
        functie: '',
        telefon_serviciu: ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (id) {
            axios.get(`http://localhost:8080/api/politisti/${id}`)
                .then(response => {
                    setFormData(response.data);
                })
                .catch(error => console.error("Eroare:", error));
        }
    }, [id]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = () => {
        axios.put(`http://localhost:8080/api/politisti/${id}`, formData)
            .then(() => {
                toast.success("Polițist actualizat!"); // <--- SUCCES
                onSaveSuccess();
            })
            .catch(error => {
                if (error.response && error.response.status === 400) {
                    setErrors(error.response.data);
                    toast.error("Verifică câmpurile invalide!");
                } else {
                    console.error("Eroare:", error);
                    toast.error("A apărut o eroare la salvare!"); // <--- EROARE
                }
            });
    };

    return (
        <div>
            <div className="form-group">
                <label>Nume</label>
                <input type="text" name="nume" className="modal-input" value={formData.nume} onChange={handleChange} />
                {errors.nume && <span style={{color: 'red', fontSize: '12px'}}>{errors.nume}</span>}

                <label>Prenume</label>
                <input type="text" name="prenume" className="modal-input" value={formData.prenume} onChange={handleChange} />
                {errors.prenume && <span style={{color: 'red', fontSize: '12px'}}>{errors.prenume}</span>}

                <label>Grad</label>
                <input type="text" name="grad" className="modal-input" value={formData.grad} onChange={handleChange} />
                {errors.grad && <span style={{color: 'red', fontSize: '12px'}}>{errors.grad}</span>}

                <label>Funcție</label>
                <input type="text" name="functie" className="modal-input" value={formData.functie} onChange={handleChange} />
                {errors.functie && <span style={{color: 'red', fontSize: '12px'}}>{errors.functie}</span>}

                <label>Telefon</label>
                <input type="text" name="telefon_serviciu" className="modal-input" value={formData.telefon_serviciu} onChange={handleChange} />
                {errors.telefon_serviciu && <span style={{color: 'red', fontSize: '12px'}}>{errors.telefon_serviciu}</span>}
            </div>

            <div className="modal-footer">
                <button className="save-btn" onClick={handleSubmit}>
                    Salvează Modificări
                </button>
            </div>
        </div>
    );
};

export default EditPolitist;