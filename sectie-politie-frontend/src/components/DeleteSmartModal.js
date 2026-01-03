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
            {/* APLICAM CLASA NOUA AICI: modal-content-auto */}
            <div className="modal-content modal-content-auto" style={{ maxWidth: '600px', width: '90%' }}>

                <div className="modal-header" style={{ borderBottomColor: headerColor }}>
                    <h3 style={{ color: headerColor, display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                        <i className={iconClass}></i> {data.titlu}
                    </h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div style={{ padding: '20px' }}>
                    <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#333', marginTop: 0 }}>
                        {data.mesaj}
                    </p>

                    {data.elementeBlocante && data.elementeBlocante.length > 0 && (
                        <div style={{ marginTop: '15px', background: '#f8f9fa', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', maxHeight: '200px', overflowY: 'auto' }}>
                            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#555' }}>
                                Dosare asociate:
                            </h4>
                            <table className="mini-table" style={{ width: '100%', background: 'white', borderCollapse: 'collapse' }}>
                                <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '2px solid #eee' }}>Tip</th>
                                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '2px solid #eee' }}>Detalii</th>
                                    <th style={{ textAlign: 'center', padding: '8px', borderBottom: '2px solid #eee' }}>Acțiune</th>
                                </tr>
                                </thead>
                                <tbody>
                                {data.elementeBlocante.map((item, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '8px', fontWeight: 'bold', fontSize: '13px' }}>{item.tip}</td>
                                        <td style={{
                                            padding: '8px',
                                            fontSize: '13px',
                                            color: (item.descriere.includes('Activ') || item.descriere.includes('Neplatita')) ? '#dc3545' :
                                                (item.descriere.includes('Închis') || item.descriere.includes('Platita')) ? '#fd7e14' :
                                                    '#28a745'
                                        }}>
                                            {item.descriere}
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '8px' }}>
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

                {/* FOLOSIM CLASA NOUA PENTRU FOOTER */}
                <div className="modal-footer-auto" style={{ padding: '20px' }}>
                    <button
                        className="action-btn"
                        onClick={onClose}
                        style={{ backgroundColor: '#6c757d', color: 'white' }}
                    >
                        {data.severitate === 'BLOCKED' ? 'Am înțeles' : 'Anulează'}
                    </button>

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