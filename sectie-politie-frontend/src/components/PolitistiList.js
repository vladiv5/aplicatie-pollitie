import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './styles/TableStyles.css';

// Primim onAddClick de la PolitistiPage (pentru Modal)
const PolitistiList = ({ onAddClick }) => {
    const [politisti, setPolitisti] = useState([]);
    const [termenCautare, setTermenCautare] = useState('');

    useEffect(() => {
        loadPolitisti();
    }, []);

    // Funcția care aduce datele (Toate sau Căutate)
    const loadPolitisti = (termen = '') => {
        const token = localStorage.getItem('token');
        let url = 'http://localhost:8080/api/politisti';

        // Daca avem termen, schimbam URL-ul catre endpoint-ul de cautare
        if (termen) {
            url = `http://localhost:8080/api/politisti/cauta?termen=${termen}`;
        }

        axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(response => {
                setPolitisti(response.data);
            })
            .catch(error => {
                console.error("Eroare la preluarea datelor!", error);
            });
    };

    const handleSearch = (e) => {
        const valoare = e.target.value;
        setTermenCautare(valoare);
        loadPolitisti(valoare); // Căutăm direct în backend
    };

    const handleDelete = (id) => {
        if(window.confirm("Ești sigur că vrei să ștergi acest polițist?")) {
            const token = localStorage.getItem('token');
            axios.delete(`http://localhost:8080/api/politisti/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(() => {
                    // Reîncărcăm lista local sau o filtrăm
                    setPolitisti(politisti.filter(p => p.idPolitist !== id));
                })
                .catch(error => console.error("Eroare la stergere:", error));
        }
    };

    return (
        <div className="page-container">
            <h2 className="page-title">Gestiune Polițiști</h2>

            {/* --- BARA DE CONTROL STANDARD --- */}
            <div className="controls-container">
                {/* 1. Căutarea (Stil standardizat) */}
                <input
                    type="text"
                    className="search-input"
                    placeholder="Caută (Nume, Prenume, Grad)..."
                    value={termenCautare}
                    onChange={handleSearch}
                />

                {/* 2. Butonul de Adăugare (Acum deschide Modalul) */}
                <button className="add-btn-primary" onClick={onAddClick}>
                    <span>+</span> Adaugă Polițist
                </button>
            </div>

            {/* Tabelul */}
            <table className="styled-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Nume</th>
                    <th>Prenume</th>
                    <th>Grad</th>
                    <th>Funcție</th>
                    <th>Telefon</th>
                    <th>Acțiuni</th>
                </tr>
                </thead>
                <tbody>
                {politisti.map(politist => (
                    <tr key={politist.idPolitist}>
                        <td>{politist.idPolitist}</td>
                        <td>{politist.nume}</td>
                        <td>{politist.prenume}</td>
                        <td>{politist.grad}</td>
                        <td>{politist.functie}</td>
                        <td>{politist.telefon_serviciu}</td>
                        <td>
                            <div className="action-buttons-container">
                                <Link to={`/politisti/edit/${politist.idPolitist}`}>
                                    <button className="action-btn edit-btn">Edit</button>
                                </Link>
                                <button
                                    onClick={() => handleDelete(politist.idPolitist)}
                                    className="action-btn delete-btn"
                                >
                                    Șterge
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default PolitistiList;