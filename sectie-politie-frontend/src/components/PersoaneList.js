import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles/TableStyles.css';

const PersoaneList = ({ onAddClick, onEditClick }) => {
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
        loadPersoane(val);
    };

    const handleDelete = (id) => {
        if (window.confirm("Ești sigur că vrei să ștergi această persoană?")) {
            const token = localStorage.getItem('token');
            axios.delete(`http://localhost:8080/api/persoane/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(() => {
                    setPersoane(persoane.filter(p => p.idPersoana !== id));
                })
                .catch(error => {
                    console.error("Eroare la stergere:", error);
                    alert("Nu s-a putut șterge persoana. Verifică dacă are amenzi sau incidente asociate!");
                });
        }
    };

    // Funcție utilitară pentru formatare data
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('ro-RO').replace(/\./g, '/');
    };

    return (
        <div className="page-container">
            <h2 className="page-title">Registru Persoane</h2>

            <div className="controls-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Caută după nume, prenume sau CNP..."
                    value={termenCautare}
                    onChange={handleSearch}
                />
                <button className="add-btn-primary" onClick={onAddClick}>
                    <span>+</span> Adaugă Persoană
                </button>
            </div>

            <table className="styled-table">
                {/* AICI ERA PROBLEMA - Am curatat thead-ul de spatii si comentarii */}
                <thead>
                <tr>
                    <th>Nume</th>
                    <th>Prenume</th>
                    <th>CNP</th>
                    <th>Data Nașterii</th>
                    <th>Telefon</th>
                    <th>Acțiuni</th>
                </tr>
                </thead>
                <tbody>
                {persoane.map((p) => (
                    <tr key={p.idPersoana}>
                        <td>{p.nume}</td>
                        <td>{p.prenume}</td>
                        <td>{p.cnp}</td>
                        <td>
                            <td>{formatDate(p.dataNasterii)}</td>
                        </td>
                        <td>{p.telefon}</td>
                        <td>
                            <div className="action-buttons-container">
                                <button
                                    className="action-btn edit-btn"
                                    onClick={() => onEditClick(p.idPersoana)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="action-btn delete-btn"
                                    onClick={() => handleDelete(p.idPersoana)}
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

export default PersoaneList;