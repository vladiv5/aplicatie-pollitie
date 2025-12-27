import React, { useEffect, useState } from 'react';
import './styles/TableStyles.css';

const IncidenteList = ({ onAddClick }) => {
    const [incidente, setIncidente] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [termenCautare, setTermenCautare] = useState('');

    useEffect(() => {
        loadIncidente();
    }, []);

    // 1. MODIFICARE: Funcția acceptă un termen de căutare
    const loadIncidente = (termen = '') => {
        const token = localStorage.getItem('token');

        // Default: luăm toate incidentele
        let url = 'http://localhost:8080/api/incidente';

        // Dacă avem termen, schimbăm URL-ul către endpoint-ul de căutare
        if (termen) {
            url = `http://localhost:8080/api/incidente/cauta?termen=${termen}`;
        }

        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) throw new Error("Eroare la server sau lipsă acces!");
                return response.json();
            })
            .then(data => {
                setIncidente(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    };

    // 2. MODIFICARE: Funcția care se apelează când scrii în input
    const handleSearch = (e) => {
        const val = e.target.value;
        setTermenCautare(val);
        loadIncidente(val); // Apelăm serverul cu noul termen
    };

    // 3. MODIFICARE: Am ȘTERS filtrarea locală (const incidenteleAfisate = ...)
    // Datele vin deja filtrate din backend.

    if (loading) return <p>Se încarcă incidentele...</p>;
    if (error) return <p style={{color:'red'}}>{error}</p>;

    return (
        <div className="page-container">
            <h2 className="page-title">Registru Incidente</h2>

            <div className="controls-container">
                {/* 1. Input Search */}
                <input
                    type="text"
                    className="search-input"
                    placeholder="Caută incident (tip, locație, polițist)..."
                    value={termenCautare}
                    onChange={handleSearch} // Apelăm noua funcție
                />

                {/* 2. Butonul Verde de Adăugare */}
                <button className="add-btn-primary" onClick={onAddClick}>
                    <span>+</span> Adaugă Incident
                </button>
            </div>

            <table className="styled-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Tip</th>
                    <th>Data & Ora</th>
                    <th>Locație (Descriere)</th>
                    <th>Adresă Exactă</th>
                    <th>Polițist</th>
                    <th>Detalii Incident</th>
                </tr>
                </thead>
                <tbody>
                {/* 4. MODIFICARE: Mapăm direct 'incidente' */}
                {incidente.map((incident) => (
                    <tr key={incident.idIncident}>
                        <td>{incident.idIncident}</td>
                        <td>{incident.tipIncident}</td>
                        <td>
                            {incident.dataEmitere
                                ? new Date(incident.dataEmitere).toLocaleString()
                                : '-'}
                        </td>
                        <td>{incident.descriereLocatie}</td>
                        <td>
                            {incident.adresaIncident
                                ? `${incident.adresaIncident.strada || ''} ${incident.adresaIncident.numar || ''}`
                                : <span style={{color: 'gray'}}>Nespecificată</span>}
                        </td>
                        <td>
                            {incident.politistResponsabil
                                ? `${incident.politistResponsabil.nume} ${incident.politistResponsabil.prenume}`
                                : <span style={{color:'red'}}>Nealocat</span>}
                        </td>
                        <td style={{ maxWidth: '300px' }}>
                            {incident.descriereIncident}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default IncidenteList;