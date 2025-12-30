import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles/TableStyles.css';

const AmenziList = ({ onAddClick, onEditClick }) => {
    const [amenzi, setAmenzi] = useState([]);
    const [loading, setLoading] = useState(true);
    const [termenCautare, setTermenCautare] = useState('');

    useEffect(() => {
        loadAmenzi();
    }, []);

    const loadAmenzi = (termen = '') => {
        const token = localStorage.getItem('token');
        let url = 'http://localhost:8080/api/amenzi';
        if (termen) {
            url = `http://localhost:8080/api/amenzi/cauta?termen=${termen}`;
        }
        axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(response => {
                setAmenzi(response.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Eroare incarcare:", err);
                setLoading(false);
            });
    };

    const handleSearch = (e) => {
        const val = e.target.value;
        setTermenCautare(val);
        loadAmenzi(val);
    };

    const handleDelete = (id) => {
        if(window.confirm("Ești sigur că vrei să ștergi această amendă?")) {
            const token = localStorage.getItem('token');
            axios.delete(`http://localhost:8080/api/amenzi/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(() => setAmenzi(amenzi.filter(item => item.idAmenda !== id)))
                .catch(error => {
                    console.error("Eroare stergere:", error);
                    alert("Eroare la ștergere!");
                });
        }
    };

    // Funcție formatare dată (fără secunde)
    const formatDataFrumos = (isoString) => {
        if (!isoString) return '-';
        const d = new Date(isoString);
        const zi = String(d.getDate()).padStart(2, '0');
        const luna = String(d.getMonth() + 1).padStart(2, '0');
        const an = d.getFullYear();
        const ora = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        return `${zi}/${luna}/${an} ${ora}:${min}`;
    };

    if (loading) return <p>Se încarcă amenzile...</p>;

    return (
        <div className="page-container">
            <h2 className="page-title">Registru Amenzi</h2>
            <div className="controls-container">
                <input
                    type="text" className="search-input"
                    placeholder="Caută după motiv, persoană sau agent..."
                    value={termenCautare} onChange={handleSearch}
                />
                <button className="add-btn-primary" onClick={onAddClick}>
                    <span>+</span> Adaugă Amendă
                </button>
            </div>

            <table className="styled-table">
                <thead>
                <tr>
                    <th>Motiv</th>
                    <th>Suma (RON)</th>
                    <th>Stare</th>
                    <th>Data & Ora</th>
                    <th>Persoana</th>
                    <th>Agent</th>
                    <th>Acțiuni</th>
                </tr>
                </thead>
                <tbody>
                {amenzi.map((amenda) => (
                    <tr key={amenda.idAmenda}>
                        <td>{amenda.motiv}</td>
                        <td style={{fontWeight: 'bold'}}>{amenda.suma}</td>

                        {/* ACTUALIZAT PENTRU VALORILE NOI DIN DB */}
                        <td>
                            <span style={{
                                color: amenda.starePlata === 'Platita' ? 'green' : 'red',
                                fontWeight: 'bold'
                            }}>
                                {amenda.starePlata}
                            </span>
                        </td>

                        <td>{formatDataFrumos(amenda.dataEmitere)}</td>
                        <td>
                            {amenda.persoana
                                ? `${amenda.persoana.nume} ${amenda.persoana.prenume}`
                                : 'Nespecificat'}
                        </td>
                        <td>
                            {amenda.politist
                                ? `${amenda.politist.nume} ${amenda.politist.prenume}`
                                : 'Nespecificat'}
                        </td>
                        <td>
                            <div className="action-buttons-container">
                                <button
                                    className="action-btn edit-btn"
                                    onClick={() => onEditClick(amenda.idAmenda)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="action-btn delete-btn"
                                    onClick={() => handleDelete(amenda.idAmenda)}
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

export default AmenziList;