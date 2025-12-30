import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles/TableStyles.css';

const PersoaneList = ({ onAddClick, onEditClick, onViewHistoryClick, onViewAdreseClick }) => {
    const [persoane, setPersoane] = useState([]);
    const [loading, setLoading] = useState(true);
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
            .then(res => {
                setPersoane(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Eroare incarcare persoane:", err);
                setLoading(false);
            });
    };

    const handleSearch = (e) => {
        const val = e.target.value;
        setTermenCautare(val);
        loadPersoane(val);
    };

    const handleDelete = (id) => {
        if(window.confirm("Ești sigur că vrei să ștergi această persoană?")) {
            const token = localStorage.getItem('token');
            axios.delete(`http://localhost:8080/api/persoane/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(() => {
                    setPersoane(persoane.filter(p => p.idPersoana !== id));
                })
                .catch(err => {
                    console.error("Eroare stergere:", err);
                    alert("Nu se poate șterge persoana (are amenzi sau incidente asociate).");
                });
        }
    };

    // --- FUNCȚIE FORMATARE DATĂ (Cu Puncte și Centrată) ---
    const formatDataNasterii = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const zi = String(date.getDate()).padStart(2, '0');
        const luna = String(date.getMonth() + 1).padStart(2, '0');
        const an = date.getFullYear();
        // Returnăm explicit cu punct
        return `${zi}.${luna}.${an}`;
    };

    if (loading) return <p>Se încarcă persoanele...</p>;

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
                <thead>
                <tr>
                    <th>Nume</th>
                    <th>Prenume</th>
                    <th>CNP</th>
                    {/* Centram si titlul coloanei */}
                    <th style={{ textAlign: 'center' }}>Data Nașterii</th>
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

                        {/* AICI E MODIFICAREA: Formatare + Centrare */}
                        <td style={{ textAlign: 'center' }}>
                            {formatDataNasterii(p.dataNasterii)}
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
                                <button
                                    className="action-btn"
                                    style={{ backgroundColor: '#17a2b8', color: 'white', marginRight: '5px' }}
                                    onClick={() => onViewHistoryClick(p.idPersoana)}
                                    title="Vezi Istoric Incidente"
                                >
                                    <i className="fa fa-history"></i> Istoric
                                </button>
                                <button
                                    className="action-btn"
                                    style={{ backgroundColor: '#28a745', color: 'white', marginRight: '5px' }}
                                    onClick={() => onViewAdreseClick(p.idPersoana)}
                                    title="Vezi Adrese Asociate"
                                >
                                    <i className="fa fa-home"></i> Adrese
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