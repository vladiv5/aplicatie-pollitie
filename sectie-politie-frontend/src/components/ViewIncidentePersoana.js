import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles/TableStyles.css';

const ViewIncidentePersoana = ({ persoanaId, onClose }) => {
    const [istoric, setIstoric] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (persoanaId) {
            const token = localStorage.getItem('token');
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

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const d = new Date(dateString);
        return d.toLocaleDateString('ro-RO') + ' ' + d.toLocaleTimeString('ro-RO', {hour: '2-digit', minute:'2-digit'});
    };

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>

            {loading ? (
                <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Se încarcă datele...</p>
            ) : (
                /* WRAPPER CORECTAT:
                   1. Am scos 'overflow: hidden' ca să nu mai taie umbra.
                   2. Am adăugat 'boxShadow' aici explicit ca să arate ca un card.
                   3. Am scos border-ul manual gri, lăsând umbra să definească conturul.
                */
                <div style={{
                    borderRadius: '10px',
                    width: '100%',
                    marginTop: '10px',
                    backgroundColor: 'white',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)' /* Umbra vizibilă */
                }}>
                    <table className="styled-table" style={{
                        width: '100%',
                        margin: 0,
                        /* Important: Lăsăm tabelul să aibă colțurile rotunjite sus */
                        borderTopLeftRadius: '10px',
                        borderTopRightRadius: '10px',
                        borderCollapse: 'separate', /* Necesar pentru border-radius pe tabel */
                        borderSpacing: 0
                    }}>
                        <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                        <tr>
                            {/* Adăugăm rotunjire manuală la header pentru a se potrivi cu containerul */}
                            <th style={{ borderTopLeftRadius: '10px' }}>Tip Incident</th>
                            <th style={{ textAlign: 'center' }}>Data</th>
                            <th style={{ textAlign: 'center' }}>Locație</th>
                            <th style={{ textAlign: 'center', borderTopRightRadius: '10px' }}>Calitate</th>
                        </tr>
                        </thead>
                        <tbody>
                        {istoric.length > 0 ? istoric.map((item, index) => (
                            <tr key={index} style={{ borderBottom: index === istoric.length - 1 ? 'none' : '1px solid #eee' }}>
                                <td style={{ padding: '12px 15px' }}>{item.incident.tipIncident}</td>
                                <td style={{ textAlign: 'center' }}>{formatDate(item.incident.dataEmitere)}</td>
                                <td style={{ textAlign: 'center' }}>{item.incident.descriereLocatie}</td>
                                <td style={{ textAlign: 'center' }}>
                                    <span style={{
                                        fontWeight: 'bold',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        backgroundColor: (item.calitate === 'Suspect' || item.calitate === 'Faptas') ? '#ffebee' :
                                            (item.calitate === 'Victima' ? '#fff3cd' : '#e8f5e9'),
                                        color: (item.calitate === 'Suspect' || item.calitate === 'Faptas') ? '#dc3545' :
                                            (item.calitate === 'Victima' ? '#fd7e14' : '#28a745')
                                    }}>
                                        {item.calitate}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" style={{textAlign: 'center', padding: '30px', color: '#999'}}>
                                    Această persoană nu figurează în niciun incident.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="modal-footer" style={{ padding: '15px 0 0 0', display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button className="action-btn" onClick={onClose} style={{ background: '#6c757d', color: 'white' }}>
                    Închideți
                </button>
            </div>
        </div>
    );
};

export default ViewIncidentePersoana;