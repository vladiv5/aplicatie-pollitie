import React, { useEffect, useState } from 'react';
import './styles/TableStyles.css';

// Primim onAddClick de la părinte
const AdreseList = ({ onAddClick }) => {
    const [adrese, setAdrese] = useState([]);
    const [loading, setLoading] = useState(true);
    const [termenCautare, setTermenCautare] = useState('');

    useEffect(() => {
        loadAdrese();
    }, []);

    const loadAdrese = (termen = '') => {
        const token = localStorage.getItem('token');
        let url = 'http://localhost:8080/api/adrese';

        // Dacă avem termen, schimbăm URL-ul
        if (termen) {
            url = `http://localhost:8080/api/adrese/cauta?termen=${termen}`;
        }

        fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setAdrese(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Eroare fetch adrese:", err);
                setLoading(false);
            });
    };

    const handleSearch = (e) => {
        const val = e.target.value;
        setTermenCautare(val);
        loadAdrese(val);
    };

    if (loading) return <p>Se încarcă adresele...</p>;

    return (
        <div className="page-container">
            <h2 className="page-title">Lista Adrese</h2>

            {/* --- BARA DE CONTROL --- */}
            <div className="controls-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Caută (stradă, localitate, județ)..."
                    value={termenCautare}
                    onChange={handleSearch}
                />
                <button className="add-btn-primary" onClick={onAddClick}>
                    <span>+</span> Adaugă Adresă
                </button>
            </div>

            <table className="styled-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Județ / Sector</th>
                    <th>Localitate</th>
                    <th>Stradă</th>
                    <th>Nr.</th>
                    <th>Bloc</th>
                    <th>Ap.</th>
                </tr>
                </thead>
                <tbody>
                {adrese.map((adresa) => (
                    <tr key={adresa.idAdresa}>
                        <td>{adresa.idAdresa}</td>
                        <td>{adresa.judetSauSector}</td>
                        <td>{adresa.localitate}</td>
                        <td>{adresa.strada}</td>
                        <td>{adresa.numar}</td>
                        <td>{adresa.bloc ? adresa.bloc : '-'}</td>
                        <td>{adresa.apartament ? adresa.apartament : '-'}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdreseList;