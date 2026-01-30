/**
 * Modal displaying a person's criminal record / incident history.
 * @author Ivan Vlad-Daniel
 * @version January 11, 2026
 */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles/Forms.css';

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

    // I return specific colors based on the person's role (Suspect = Red, Victim = Orange).
    const getCalitateStyle = (calitate) => {
        switch(calitate) {
            case 'Suspect': case 'Faptas': return { bg: 'rgba(239, 68, 68, 0.2)', col: '#fca5a5' };
            case 'Victima': return { bg: 'rgba(245, 158, 11, 0.2)', col: '#fcd34d' };
            case 'Martor': return { bg: 'rgba(16, 185, 129, 0.2)', col: '#6ee7b7' };
            default: return { bg: 'rgba(148, 163, 184, 0.2)', col: '#cbd5e1' };
        }
    };

    return (
        <div style={{ padding: '10px' }}>
            {loading ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p style={{color:'#d4af37'}}>Loading history...</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="styled-table compact-table">
                        <thead>
                        <tr>
                            <th>Incident Type</th>
                            <th>Date</th>
                            <th>Location</th>
                            <th style={{ textAlign: 'center' }}>Role</th>
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
                                    This person is not involved in any incidents.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="modal-footer">
                <button className="btn-close-modal" onClick={onClose}>CLOSE</button>
            </div>
        </div>
    );
};

export default ViewIncidentePersoana;