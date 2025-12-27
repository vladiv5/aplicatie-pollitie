import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddPolitist = ({ onSaveSuccess, onCancel }) => { // Primim funcții de la părinte
    const [formData, setFormData] = useState({
        nume: '',
        prenume: '',
        grad: '',
        functie: '',
        telefon: ''
    });

    const [isValid, setIsValid] = useState(false);

    // Verificăm validarea la fiecare schimbare
    useEffect(() => {
        const { nume, prenume, grad, functie, telefon } = formData;
        // Validare simplă: toate câmpurile să nu fie goale
        const valid = nume.trim() && prenume.trim() && grad.trim() && functie.trim() && telefon.trim();
        setIsValid(valid);
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
            telefon_serviciu: formData.telefon // Atenție la numele din backend!
        })
            .then(() => {
                // Curățăm formularul și anunțăm părintele
                setFormData({ nume: '', prenume: '', grad: '', functie: '', telefon: '' });
                onSaveSuccess();
            })
            .catch(error => console.error("Eroare la salvare:", error));
    };

    return (
        <div>
            <div className="form-group">
                <input type="text" name="nume" placeholder="Nume" className="modal-input" value={formData.nume} onChange={handleChange} />
                <input type="text" name="prenume" placeholder="Prenume" className="modal-input" value={formData.prenume} onChange={handleChange} />
                <input type="text" name="grad" placeholder="Grad" className="modal-input" value={formData.grad} onChange={handleChange} />
                <input type="text" name="functie" placeholder="Funcție" className="modal-input" value={formData.functie} onChange={handleChange} />
                <input type="text" name="telefon" placeholder="Telefon Serviciu" className="modal-input" value={formData.telefon} onChange={handleChange} />
            </div>

            <div className="modal-footer">
                <button
                    className="save-btn"
                    onClick={handleSave}
                    disabled={!isValid} // Butonul e gri dacă nu e valid
                >
                    Salvează
                </button>
            </div>
        </div>
    );
};

export default AddPolitist;