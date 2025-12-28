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
                .then(() => {
                    setAmenzi(amenzi.filter(item => item.idAmenda !== id));
                })
                .catch(error => {
                    console.error("Eroare stergere:", error);
                    alert("Eroare la ștergere!");
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
            <h2 className="page-title">Registru Amenzi</h2>

            <div className="controls-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Caută după motiv, persoană sau agent..."
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
                    <th>Motiv</th>
                    <th>Suma (RON)</th>
                    <th>Stare</th>
                    <th>Data</th>
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

                        {/* Stilizează condiționat starea plății */}
                        <td>
                            <span style={{
                                color: amenda.starePlata === 'Achitat' ? 'green' : 'red',
                                fontWeight: 'bold'
                            }}>
                                {amenda.starePlata}
                            </span>
                        </td>

                        <td>
                            {amenda.dataEmitere
                                ? new Date(amenda.dataEmitere).toLocaleString('ro-RO').substring(0, 17) // Include și ora
                                : '-'}
                        </td>

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