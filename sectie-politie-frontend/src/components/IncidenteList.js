import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles/TableStyles.css';

// Adaugam onViewClick in props
const IncidenteList = ({ onAddClick, onEditClick, onViewClick }) => {
    const [incidente, setIncidente] = useState([]);
    const [loading, setLoading] = useState(true);
    const [termenCautare, setTermenCautare] = useState('');

    useEffect(() => {
        loadIncidente();
    }, []);

    const loadIncidente = (termen = '') => {
        const token = localStorage.getItem('token');
        let url = 'http://localhost:8080/api/incidente';

        if (termen) {
            url = `http://localhost:8080/api/incidente/cauta?termen=${termen}`;
        }

        axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(response => {
                setIncidente(response.data);
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
        loadIncidente(val);
    };

    const handleDelete = (id) => {
        if(window.confirm("Ești sigur că vrei să ștergi acest incident?")) {
            const token = localStorage.getItem('token');
            axios.delete(`http://localhost:8080/api/incidente/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(() => {
                    setIncidente(incidente.filter(item => item.idIncident !== id));
                })
                .catch(error => {
                    console.error("Eroare la stergere:", error);
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
            <h2 className="page-title">Registru Incidente</h2>

            <div className="controls-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Caută după tip, locație sau incident..."
                    value={termenCautare}
                    onChange={handleSearch}
                />

                <button className="add-btn-primary" onClick={onAddClick}>
                    <span>+</span> Adaugă Incident
                </button>
            </div>

            <table className="styled-table">
                <thead>
                <tr>
                    <th>Tip</th>
                    <th>Data & Ora</th>
                    <th>Locație (Scurt)</th>
                    <th>Adresă</th>
                    <th>Polițist</th>
                    {/* Am scos coloana veche de Detalii text */}
                    <th>Acțiuni</th>
                </tr>
                </thead>
                <tbody>
                {incidente.map((incident) => (
                    <tr key={incident.idIncident}>
                        <td>{incident.tipIncident}</td>
                        <td>
                            {incident.dataEmitere
                                ? new Date(incident.dataEmitere).toLocaleString('ro-RO').substring(0, 17)
                                : '-'}
                        </td>
                        <td>{incident.descriereLocatie}</td>

                        {/* CORECTIE ADRESA: Doar variabilele, fara "Str." in fata */}
                        <td>
                            {incident.adresaIncident
                                ? `${incident.adresaIncident.strada} ${incident.adresaIncident.numar}`
                                : '-'}
                        </td>

                        <td>
                            {incident.politistResponsabil
                                ? `${incident.politistResponsabil.nume} ${incident.politistResponsabil.prenume}`
                                : 'Nealocat'}
                        </td>

                        <td>
                            <div className="action-buttons-container">
                                {/* 1. Buton VEZI DETALII (Albastru) */}
                                <button
                                    className="action-btn"
                                    style={{ backgroundColor: '#17a2b8', color: 'white' }}
                                    onClick={() => onViewClick(incident)}
                                    title="Vezi detalii complete"
                                >
                                    Vezi
                                </button>

                                {/* 2. Buton EDIT (Galben/Standard) */}
                                <button
                                    className="action-btn edit-btn"
                                    onClick={() => onEditClick(incident.idIncident)}
                                >
                                    Edit
                                </button>

                                {/* 3. Buton DELETE (Rosu) */}
                                <button
                                    className="action-btn delete-btn"
                                    onClick={() => handleDelete(incident.idIncident)}
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

export default IncidenteList;