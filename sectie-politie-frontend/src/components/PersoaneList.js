import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Folosim axios pentru consistență
import './styles/TableStyles.css';

const PersoaneList = ({ onAddClick }) => {
    const [persoane, setPersoane] = useState([]);
    const [termenCautare, setTermenCautare] = useState('');

    useEffect(() => {
        loadPersoane();
    }, []);

    const loadPersoane = (termen = '') => {
        const token = localStorage.getItem('token');
        let url = 'http://localhost:8080/api/persoane';

        if (termen) {
            url = `http://localhost:8080/api/persoane/cauta?termen=${termen}`;
        }

        axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => setPersoane(res.data))
            .catch(err => console.error("Eroare incarcare:", err));
    };

    const handleSearch = (e) => {
        const val = e.target.value;
        setTermenCautare(val);
        // Putem pune un debounce aici daca vrem, dar merge si direct
        loadPersoane(val);
    };

    return (
        <div className="page-container">
            <h2 className="page-title">Registru Persoane</h2>

            {/* BARA DE CONTROL */}
            <div className="controls-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Caută după Nume, Prenume sau CNP..."
                    value={termenCautare}
                    onChange={handleSearch}
                />
                <button className="add-btn-primary" onClick={onAddClick}>
                    <span>+</span> Adaugă Persoană
                </button>
            </div>

            <table className="styled-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Nume</th>
                    <th>Prenume</th>
                    <th>CNP</th>
                    <th>Data Nașterii</th>
                    <th>Telefon</th>
                </tr>
                </thead>
                <tbody>
                {persoane.map((p) => (
                    <tr key={p.idPersoana}>
                        <td>{p.idPersoana}</td>
                        <td>{p.nume}</td>
                        <td>{p.prenume}</td>
                        <td>{p.cnp}</td>
                        <td>
                            {p.dataNasterii
                                ? new Date(p.dataNasterii).toLocaleDateString()
                                : '-'}
                        </td>
                        <td>{p.telefon}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default PersoaneList;