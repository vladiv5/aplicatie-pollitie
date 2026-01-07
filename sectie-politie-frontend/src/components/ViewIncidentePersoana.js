import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles/Forms.css'; // Importăm stilurile

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

    // Funcție helper pentru culoarea calității
    const getCalitateStyle = (calitate) => {
        switch(calitate) {
            case 'Suspect': case 'Faptas': return { bg: '#fee2e2', col: '#991b1b' }; // Roșu
            case 'Victima': return { bg: '#fef3c7', col: '#92400e' }; // Portocaliu
            case 'Martor': return { bg: '#dcfce7', col: '#166534' }; // Verde
            default: return { bg: '#f1f5f9', col: '#475569' }; // Gri
        }
    };

    return (
        <div style={{ padding: '10px' }}>
            {loading ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Se încarcă istoricul...</p>
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
                                    <td style={{fontWeight: '500'}}>{item.incident.tipIncident}</td>
                                    <td>{formatDate(item.incident.dataEmitere)}</td>
                                    <td>{item.incident.descriereLocatie}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className="badge-status" style={{ backgroundColor: style.bg, color: style.col }}>
                                            {item.calitate}
                                        </span>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan="4" style={{textAlign: 'center', padding: '30px', color: '#64748b'}}>
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