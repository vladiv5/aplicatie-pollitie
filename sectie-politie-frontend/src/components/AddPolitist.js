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
    const [errors, setErrors] = useState({}); // Aici tinem erorile primite de la backend

    const [isValid, setIsValid] = useState(false);

    // Verificăm validarea la fiecare schimbare
    useEffect(() => {
        const { nume, prenume } = formData;

        // Validare simplă: Doar numele si prenumele obligatorii!
        const valid = nume.trim().length > 0 && prenume.trim().length > 0;
        setIsValid(true); // Am renuntat la validarile in frontend, functia nu are niciun sens dar daca o scot imi crapa site-ul asa ca am lasat-o asa :)
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
            .catch(error => {
                if (error.response && error.response.status === 400) {
                    // Aici primim harta cu erori din Java (GlobalExceptionHandler)
                    setErrors(error.response.data);
                } else {
                    console.error("Eroare:", error);
                    alert("A apărut o eroare neașteptată!");
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
                    disabled={!isValid} // Butonul e gri dacă nu e valid
                >
                    Salvează
                </button>
            </div>
        </div>
    );
};

export default AddPolitist;