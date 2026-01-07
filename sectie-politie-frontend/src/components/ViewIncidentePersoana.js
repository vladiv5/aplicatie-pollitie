import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles/Forms.css'; // Asigură-te că stilurile globale sunt încărcate

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

    // Funcție helper pentru culori pe fundal Dark Navy
    const getCalitateStyle = (calitate) => {
        switch(calitate) {
            // Folosim culori mai luminoase pentru text și fundaluri semi-transparente
            case 'Suspect': case 'Faptas': return { bg: 'rgba(239, 68, 68, 0.2)', col: '#fca5a5' }; // Roșu deschis
            case 'Victima': return { bg: 'rgba(245, 158, 11, 0.2)', col: '#fcd34d' }; // Galben/Portocaliu
            case 'Martor': return { bg: 'rgba(16, 185, 129, 0.2)', col: '#6ee7b7' }; // Verde Mentă
            default: return { bg: 'rgba(148, 163, 184, 0.2)', col: '#cbd5e1' }; // Gri albăstrui
        }
    };

    return (
        <div style={{ padding: '10px' }}>
            {loading ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p style={{color:'#d4af37'}}>Se încarcă istoricul...</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="styled-table compact-table">
                        <thead>
                        <tr>
                            <th>Tip Incident</th>
                            <th>Data</th>
                            <th>Locație</th>
                            <th style={{ textAlign: 'center' }}>Calitate</th>
                        </tr>
                        </thead>
                        <tbody>
                        {istoric.length > 0 ? istoric.map((item, index) => {
                            const style = getCalitateStyle(item.calitate);
                            return (
                                <tr key={index}>
                                    <td style={{fontWeight: '700', color: '#ffffff'}}>{item.incident.tipIncident}</td>
                                    <td>{formatDate(item.incident.dataEmitere)}</td>
                                    <td>{item.incident.descriereLocatie}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className="badge-status" style={{ backgroundColor: style.bg, color: style.col, border: `1px solid ${style.col}` }}>
                                            {item.calitate}
                                        </span>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan="4" style={{textAlign: 'center', padding: '30px', color: '#94a3b8', fontStyle: 'italic'}}>
                                    Această persoană nu figurează în niciun incident.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="modal-footer">
                <button className="btn-close-modal" onClick={onClose}>
                    ÎNCHIDEȚI
                </button>
            </div>
        </div>
    );
};

export default ViewIncidentePersoana;