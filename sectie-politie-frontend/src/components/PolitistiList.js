import React, { useEffect, useState } from 'react';
import axios from 'axios';
// Am scos import { Link } from 'react-router-dom' - nu mai avem nevoie de el
import './styles/TableStyles.css';

// Primim onAddClick SI onEditClick de la PolitistiPage
const PolitistiList = ({ onAddClick, onEditClick }) => {
    const [politisti, setPolitisti] = useState([]);
    const [termenCautare, setTermenCautare] = useState('');

    useEffect(() => {
        loadPolitisti();
    }, []);

    const loadPolitisti = (termen = '') => {
        const token = localStorage.getItem('token');
        let url = 'http://localhost:8080/api/politisti';

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
        loadPolitisti(valoare);
    };

    const handleDelete = (id) => {
        if(window.confirm("Ești sigur că vrei să ștergi acest polițist?")) {
            const token = localStorage.getItem('token');
            axios.delete(`http://localhost:8080/api/politisti/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(() => {
                    setPolitisti(politisti.filter(p => p.idPolitist !== id));
                })
                .catch(error => console.error("Eroare la stergere:", error));
        }
    };

    return (
        <div className="page-container">
            <h2 className="page-title">Gestiune Polițiști</h2>

            <div className="controls-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Caută după nume, prenume sau grad..."
                    value={termenCautare}
                    onChange={handleSearch}
                />

                <button className="add-btn-primary" onClick={onAddClick}>
                    <span>+</span> Adaugă Polițist
                </button>
            </div>

            <table className="styled-table">
                <thead>
                <tr>
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
                        <td>{politist.nume}</td>
                        <td>{politist.prenume}</td>
                        <td>{politist.grad}</td>
                        <td>{politist.functie}</td>
                        <td>{politist.telefon_serviciu}</td>
                        <td>
                            <div className="action-buttons-container">
                                {/* MODIFICARE AICI: Buton normal in loc de Link */}
                                <button
                                    className="action-btn edit-btn"
                                    onClick={() => onEditClick(politist.idPolitist)}
                                >
                                    Edit
                                </button>

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