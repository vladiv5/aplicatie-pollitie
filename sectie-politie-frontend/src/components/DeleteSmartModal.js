import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/TableStyles.css';

const DeleteSmartModal = ({ isOpen, onClose, onConfirm, data, currentPolitistId, returnRoute = '/politisti' }) => {
    const navigate = useNavigate();

    if (!isOpen || !data) return null;

    let headerColor = '#28a745';
    let iconClass = 'fa fa-check-circle';

    if (data.severitate === 'WARNING') {
        headerColor = '#fd7e14';
        iconClass = 'fa fa-exclamation-triangle';
    } else if (data.severitate === 'BLOCKED') {
        headerColor = '#dc3545';
        iconClass = 'fa fa-ban';
    }

    // Navigare "Bumerang"
    const handleJump = (type, itemId) => {
        const targetRoute = type === 'Incident' ? '/incidente' : '/amenzi';
        navigate(targetRoute, {
            state: {
                openEditId: itemId,
                returnTo: returnRoute,
                returnAction: 'reOpenDelete',
                returnId: currentPolitistId
            }
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '600px', width: '90%' }}>

                <div className="modal-header" style={{ borderBottomColor: headerColor }}>
                    <h3 style={{ color: headerColor, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i className={iconClass}></i> {data.titlu}
                    </h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="form-group">
                    <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#333' }}>
                        {data.mesaj}
                    </p>

                    {/* TABEL CU ELEMENTE ASOCIATE (Apare Mereu daca exista date) */}
                    {data.elementeBlocante && data.elementeBlocante.length > 0 && (
                        <div style={{ marginTop: '15px', background: '#f8f9fa', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', maxHeight: '200px', overflowY: 'auto' }}>
                            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#555' }}>
                                Dosare asociate:
                            </h4>
                            <table className="mini-table" style={{ width: '100%', background: 'white' }}>
                                <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '5px' }}>Tip</th>
                                    <th style={{ textAlign: 'left', padding: '5px' }}>Detalii</th>
                                    <th style={{ textAlign: 'center', padding: '5px' }}>Acțiune</th>
                                </tr>
                                </thead>
                                <tbody>
                                {data.elementeBlocante.map((item, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '5px', fontWeight: 'bold' }}>{item.tip}</td>
                                        <td style={{
                                            padding: '5px',
                                            color: (item.descriere.includes('Activ') || item.descriere.includes('Neplatita')) ? '#dc3545' : // Rosu
                                                (item.descriere.includes('Închis') || item.descriere.includes('Platita')) ? '#fd7e14' : // Portocaliu
                                                    '#28a745' // Verde
                                        }}>
                                            {item.descriere}
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '5px' }}>
                                            <button
                                                onClick={() => handleJump(item.tip, item.id)}
                                                className="action-btn"
                                                style={{
                                                    padding: '4px 8px',
                                                    backgroundColor: 'white',
                                                    border: '1px solid #007bff',
                                                    color: '#007bff',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                Modifică
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button
                        className="action-btn"
                        onClick={onClose}
                        style={{ backgroundColor: '#6c757d', color: 'white', marginRight: '10px' }}
                    >
                        {data.severitate === 'BLOCKED' ? 'Am înțeles' : 'Anulează'}
                    </button>

                    {/* Butonul de Stergere (Fara ID in text) */}
                    {data.severitate !== 'BLOCKED' && (
                        <button
                            className="save-btn"
                            style={{ backgroundColor: '#dc3545' }}
                            onClick={onConfirm}
                        >
                            Șterge Definitiv
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeleteSmartModal;