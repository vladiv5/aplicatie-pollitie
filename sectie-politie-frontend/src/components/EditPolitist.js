import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ACUM: Primim ID-ul si functiile direct de la parinte (PolitistiPage), nu din URL
const EditPolitist = ({ id, onSaveSuccess, onCancel }) => {

    const [formData, setFormData] = useState({
        nume: '',
        prenume: '',
        grad: '',
        functie: '',
        telefon_serviciu: ''
    });

    // Incarcam datele cand componenta se monteaza sau se schimba ID-ul
    useEffect(() => {
        if (id) {
            axios.get(`http://localhost:8080/api/politisti/${id}`)
                .then(response => {
                    setFormData(response.data);
                })
                .catch(error => console.error("Eroare la încărcare date polițist:", error));
        }
    }, [id]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = () => {
        // PUT request catre backend
        axios.put(`http://localhost:8080/api/politisti/${id}`, formData)
            .then(() => {
                // Nu mai facem navigate, ci anuntam parintele ca am terminat
                onSaveSuccess();
            })
            .catch(error => {
                console.error("Eroare la update:", error);
                alert("Eroare la modificare!");
            });
    };

    return (
        <div>
            {/* Am refolosit clasele din AddPolitist pentru design consistent */}
            <div className="form-group">
                <label>Nume</label>
                <input type="text" name="nume" className="modal-input" value={formData.nume} onChange={handleChange} />

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
                <button className="save-btn" onClick={handleSubmit}>
                    Salvează Modificări
                </button>
                {/* Optional: Buton de Anuleaza daca vrei sa fie explicit */}
                {/* <button className="cancel-btn" onClick={onCancel}>Anulează</button> */}
            </div>
        </div>
    );
};

export default EditPolitist;