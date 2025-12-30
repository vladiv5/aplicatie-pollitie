import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles/TableStyles.css';

const ViewIncidentePersoana = ({ persoanaId, onClose }) => {
    const [istoric, setIstoric] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (persoanaId) {
            const token = localStorage.getItem('token');
            // Apelăm noul endpoint creat în backend
            axios.get(`http://localhost:8080/api/participanti/persoana/${persoanaId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => {
                    setIstoric(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [persoanaId]);

    // Funcție mică pentru formatarea datei
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const d = new Date(dateString);
        return d.toLocaleDateString('ro-RO') + ' ' + d.toLocaleTimeString('ro-RO', {hour: '2-digit', minute:'2-digit'});
    };

    return (
        <div style={{ padding: '10px' }}>
            <h3>Istoric Incidente</h3>

            {loading ? <p>Se încarcă...</p> : (
                <table className="styled-table" style={{ marginTop: '15px' }}>
                    <thead>
                    <tr>
                        <th>Tip Incident</th>
                        <th>Data</th>
                        <th>Locație</th>
                        <th>Calitate</th> {/* Rolul persoanei în incident */}
                    </tr>
                    </thead>
                    <tbody>
                    {istoric.map((item, index) => (
                        <tr key={index}>
                            {/* Accesăm datele din obiectul imbricat 'incident' */}
                            <td>{item.incident.tipIncident}</td>
                            <td>{formatDate(item.incident.dataEmitere)}</td>
                            <td>{item.incident.descriereLocatie}</td>
                            <td>
                                    <span style={{
                                        fontWeight: 'bold',
                                        // Colorăm în funcție de rol
                                        color: (item.calitate === 'Suspect' || item.calitate === 'Faptas') ? 'red' :
                                            (item.calitate === 'Victima' ? 'orange' : 'green')
                                    }}>
                                        {item.calitate}
                                    </span>
                            </td>
                        </tr>
                    ))}
                    {istoric.length === 0 && (
                        <tr>
                            <td colSpan="4" style={{textAlign: 'center'}}>
                                Această persoană nu a fost implicată în niciun incident.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            )}

            <div className="modal-footer" style={{ marginTop: '20px' }}>
                <button className="action-btn" onClick={onClose} style={{ background: '#6c757d', color: 'white' }}>
                    Închide
                </button>
            </div>
        </div>
    );
};

export default ViewIncidentePersoana;