import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const EditPolitist = () => {
    const { id } = useParams(); // Luăm ID-ul din URL (ex: 5)
    const navigate = useNavigate(); // Unealta pentru a ne întoarce la listă

    // 1. Starea formularului (inițial goală)
    const [formData, setFormData] = useState({
        nume: '',
        prenume: '',
        grad: '',
        functie: '',
        telefonServiciu: '' // Atenție: camelCase ca în Java
    });

    // 2. Încărcăm datele existente când deschidem pagina
    useEffect(() => {
        axios.get(`http://localhost:8080/api/politisti/${id}`)
            .then(response => {
                // Pre-completăm formularul cu datele primite de la Java
                console.log("Ce am primit de la Java:", response.data);
                setFormData(response.data);
            })
            .catch(error => console.error("Eroare la încărcare:", error));
    }, [id]);

    // 3. Gestionăm tastarea (la fel ca la Add)
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // 4. Gestionăm Salvarea (PUT în loc de POST)
    const handleSubmit = (e) => {
        e.preventDefault();
        // Atenție: URL-ul include ID-ul pentru PUT
        axios.put(`http://localhost:8080/api/politisti/${id}`, formData)
            .then(() => {
                alert("Modificare reușită!");
                navigate('/politisti'); // Ne întoarcem la tabel
            })
            .catch(error => {
                console.error("Eroare la update:", error);
                alert("Eroare la modificare!");
            });
    };

    return (
        <div style={{ padding: '20px' }}>
            <h3>Editează Polițist (ID: {id})</h3>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <label>Nume: </label>
                    <input type="text" name="nume" value={formData.nume} onChange={handleChange} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Prenume: </label>
                    <input type="text" name="prenume" value={formData.prenume} onChange={handleChange} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Grad: </label>
                    <input type="text" name="grad" value={formData.grad} onChange={handleChange} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Funcție: </label>
                    <input type="text" name="functie" value={formData.functie} onChange={handleChange} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Telefon: </label>
                    <input type="text" name="telefon_serviciu" value={formData.telefon_serviciu} onChange={handleChange} />
                </div>

                <button type="submit" style={{ backgroundColor: 'orange', padding: '10px 20px', border: 'none', cursor: 'pointer' }}>
                    Actualizează
                </button>
            </form>
        </div>
    );
};

export default EditPolitist;