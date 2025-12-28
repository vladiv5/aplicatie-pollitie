import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Folosim axios pentru consistență la ștergere
import './styles/TableStyles.css';

const AdreseList = ({ onAddClick, onEditClick }) => {
    const [adrese, setAdrese] = useState([]);
    const [loading, setLoading] = useState(true);
    const [termenCautare, setTermenCautare] = useState('');

    useEffect(() => {
        loadAdrese();
    }, []);

    const loadAdrese = (termen = '') => {
        const token = localStorage.getItem('token');
        let url = 'http://localhost:8080/api/adrese';

        if (termen) {
            url = `http://localhost:8080/api/adrese/cauta?termen=${termen}`;
        }

        // Am schimbat fetch cu axios pentru consistență, dar mergea și fetch
        axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => {
                setAdrese(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Eroare incarcare adrese:", err);
                setLoading(false);
            });
    };

    const handleSearch = (e) => {
        const val = e.target.value;
        setTermenCautare(val);
        loadAdrese(val);
    };

    // Funcția de ștergere
    const handleDelete = (id) => {
        if(window.confirm("Ești sigur că vrei să ștergi această adresă?")) {
            const token = localStorage.getItem('token');
            axios.delete(`http://localhost:8080/api/adrese/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(() => {
                    // Scoatem elementul din lista locală
                    setAdrese(adrese.filter(a => a.idAdresa !== id));
                })
                .catch(err => {
                    console.error("Eroare stergere:", err);
                    alert("Nu se poate șterge adresa (posibil să fie folosită într-un incident/buletin).");
                });
        }
    };

    return (
        <div className="page-container">
            <h2 className="page-title">Lista Adrese</h2>

            <div className="controls-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Caută după stradă, localitate sau județ/sector..."
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
                    <th>Județ / Sector</th>
                    <th>Localitate</th>
                    <th>Stradă</th>
                    <th>Nr.</th>
                    <th>Bloc</th>
                    <th>Ap.</th>
                    <th>Acțiuni</th> {/* Coloana nouă */}
                </tr>
                </thead>
                <tbody>
                {adrese.map((adresa) => (
                    <tr key={adresa.idAdresa}>
                        <td>{adresa.judetSauSector}</td>
                        <td>{adresa.localitate}</td>
                        <td>{adresa.strada}</td>
                        <td>{adresa.numar}</td>
                        <td>{adresa.bloc ? adresa.bloc : '-'}</td>
                        <td>{adresa.apartament ? adresa.apartament : '-'}</td>

                        {/* Butoanele de acțiune */}
                        <td>
                            <div className="action-buttons-container">
                                <button
                                    className="action-btn edit-btn"
                                    onClick={() => onEditClick(adresa.idAdresa)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="action-btn delete-btn"
                                    onClick={() => handleDelete(adresa.idAdresa)}
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

export default AdreseList;