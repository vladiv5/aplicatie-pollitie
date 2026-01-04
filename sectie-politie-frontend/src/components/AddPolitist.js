import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast'; // <--- IMPORT CORECT

const AddPolitist = ({ onSaveSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        nume: '',
        prenume: '',
        grad: '',
        functie: '',
        telefon: ''
    });
    const [errors, setErrors] = useState({});
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        const { nume, prenume } = formData;
        const valid = nume.trim().length > 0 && prenume.trim().length > 0;
        setIsValid(true);
    }, [formData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        axios.post('http://localhost:8080/api/politisti', {
            nume: formData.nume,
            prenume: formData.prenume,
            grad: formData.grad,
            functie: formData.functie,
            telefon_serviciu: formData.telefon
        })
            .then(() => {
                setFormData({ nume: '', prenume: '', grad: '', functie: '', telefon: '' });

                // 1. AICI AM ADAUGAT NOTIFICAREA DE SUCCES
                toast.success("Polițist înregistrat în sistem!");

                onSaveSuccess();
            })
            .catch(error => {
                if (error.response && error.response.status === 400) {
                    setErrors(error.response.data);
                    // Optional: Poti pune un toast mic si aici
                    toast.error("Verifică câmpurile invalide!");
                } else {
                    console.error("Eroare:", error);
                    toast.error("Eroare la salvare!");
                }
            });
    };

    return (
        <div>
            <div className="form-group">
                <input type="text" name="nume" placeholder="Nume" className="modal-input" value={formData.nume} onChange={handleChange} />
                {errors.nume && <span style={{color: 'red', fontSize: '12px'}}>{errors.nume}</span>}

                <input type="text" name="prenume" placeholder="Prenume" className="modal-input" value={formData.prenume} onChange={handleChange} />
                {errors.prenume && <span style={{color: 'red', fontSize: '12px'}}>{errors.prenume}</span>}

                <input type="text" name="grad" placeholder="Grad" className="modal-input" value={formData.grad} onChange={handleChange} />
                {errors.grad && <span style={{color: 'red', fontSize: '12px'}}>{errors.grad}</span>}

                <input type="text" name="functie" placeholder="Funcție" className="modal-input" value={formData.functie} onChange={handleChange} />
                {errors.functie && <span style={{color: 'red', fontSize: '12px'}}>{errors.functie}</span>}

                <input type="text" name="telefon" placeholder="Telefon Serviciu" className="modal-input" value={formData.telefon} onChange={handleChange} />
                {errors.telefon_serviciu && <span style={{color: 'red', fontSize: '12px'}}>{errors.telefon_serviciu}</span>}
            </div>

            <div className="modal-footer">
                <button
                    className="save-btn"
                    onClick={handleSave}
                    disabled={!isValid}
                >
                    Salvează
                </button>
            </div>
        </div>
    );
};

export default AddPolitist;