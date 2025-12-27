import React, { useState } from "react";
import axios from 'axios';

const AddPolitist = () => {
    const [formData, setFormData] = useState({
        nume: '',
        prenume: '',
        grad: '',
        functie: '',
        telefon_serviciu: ''
    });

    // Gestioneaza schimbarea arrayului starii temporare formData
    const handleChange = (e) => {
        setFormData({
            ...formData, // Pastrez ce era in obiectul initial
            [e.target.name]: e.target.value // Modific doar campul in care utilizatorul scrie inputul
        });
    };

    // Gestioneaza adaugarea efectiva in baza de date prin formData
    const handleSubmit = (e) => {
        e.preventDefault() // Previne reloadul automat
        axios.post('http://localhost:8080/api/politisti', formData)
            .then(() => {
                alert("Adaugat cu succes!");
                window.location.reload();
            })
            .catch(err => console.error(err));
    };
    return (
        <div>
            <h3>Adauga Politist</h3>
            <form onSubmit={handleSubmit}>
                <input type="text" name="nume" placeholder="Nume" value={formData.nume} onChange={handleChange} />
                <input type="text" name="prenume" placeholder="Prenume" value={formData.prenume} onChange={handleChange} />
                <input type="text" name="grad" placeholder="Grad" value={formData.grad} onChange={handleChange} />
                <input type="text" name="functie" placeholder="Functie" value={formData.functie} onChange={handleChange} />
                <input type="text" name="telefon_serviciu" placeholder="Telefon Serviciu" value={formData.telefon_serviciu} onChange={handleChange} />

                <button type="submit">Salveaza</button>
            </form>
        </div>
    );
};

export default AddPolitist;