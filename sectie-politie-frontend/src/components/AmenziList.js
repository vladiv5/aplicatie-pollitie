import React, { useEffect, useState } from 'react';
import './styles/TableStyles.css';

// Primim onAddClick de la părinte
const AmenziList = ({ onAddClick }) => {
    const [amenzi, setAmenzi] = useState([]);
    const [loading, setLoading] = useState(true);
    const [termenCautare, setTermenCautare] = useState('');

    useEffect(() => {
        loadAmenzi();
    }, []);

    // Funcția care încarcă datele (Toate sau Căutate)
    const loadAmenzi = (termen = '') => {
        const token = localStorage.getItem('token');
        let url = 'http://localhost:8080/api/amenzi';

        // Dacă scriem ceva, schimbăm URL-ul
        if (termen) {
            url = `http://localhost:8080/api/amenzi/cauta?termen=${termen}`;
        }

        fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setAmenzi(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Eroare fetch amenzi:", err);
                setLoading(false);
            });
    };

    const handleSearch = (e) => {
        const val = e.target.value;
        setTermenCautare(val);
        loadAmenzi(val);
    };

    if (loading) return <p>Se încarcă amenzile...</p>;

    return (
        <div className="page-container">
            <h2 className="page-title">Registru Amenzi</h2>

            {/* --- BARA DE CONTROL --- */}
            <div className="controls-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Caută (motiv, polițist, persoană)..."
                    value={termenCautare}
                    onChange={handleSearch}
                />
                <button className="add-btn-primary" onClick={onAddClick}>
                    <span>+</span> Adaugă Amendă
                </button>
            </div>

            <table className="styled-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Data Emitere</th>
                    <th>Motiv</th>
                    <th>Sumă</th>
                    <th>Stare Plată</th>
                    <th>Persoana Amendată</th>
                    <th>Agent Constatator</th>
                </tr>
                </thead>
                <tbody>
                {amenzi.map((amenda) => (
                    <tr key={amenda.idAmenda}>
                        <td>{amenda.idAmenda}</td>
                        <td>
                            {amenda.dataEmitere
                                ? new Date(amenda.dataEmitere).toLocaleString()
                                : '-'}
                        </td>
                        <td>{amenda.motiv}</td>
                        <td style={{ fontWeight: 'bold' }}>
                            {amenda.suma} RON
                        </td>
                        <td>
                            <span style={{
                                color: amenda.starePlata === 'Achitat' ? 'green' : 'red',
                                fontWeight: 'bold'
                            }}>
                                {amenda.starePlata}
                            </span>
                        </td>
                        <td>
                            {amenda.persoana
                                ? `${amenda.persoana.nume} ${amenda.persoana.prenume}`
                                : '-'}
                        </td>
                        <td>
                            {amenda.politist
                                ? `${amenda.politist.nume} ${amenda.politist.prenume}`
                                : '-'}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default AmenziList;