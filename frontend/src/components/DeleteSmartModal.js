/**
 * Critical Component for the "Smart Delete" system.
 * It analyzes dependencies (Fines, Incidents) and decides if deletion is safe.
 * I implemented 'Boomerang' logic here to allow quick navigation to blocking items.
 * @author Ivan Vlad-Daniel
 * @version January 11, 2026
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/TableStyles.css';

const DeleteSmartModal = ({ isOpen, onClose, onConfirm, data, currentPolitistId, returnRoute = '/politisti' }) => {
    const navigate = useNavigate();

    if (!isOpen || !data) return null;

    // I determine the visual theme based on severity level received from Backend.
    let statusColor = '#10b981'; // Green (SAFE)
    let iconClass = 'fa fa-check-circle';

    if (data.severitate === 'WARNING') {
        statusColor = '#f59e0b'; // Orange (History exists, but delete is allowed)
        iconClass = 'fa fa-exclamation-triangle';
    } else if (data.severitate === 'BLOCKED') {
        statusColor = '#ef4444'; // Red (Deletion forbidden)
        iconClass = 'fa fa-ban';
    }

    // I navigate to the blocking item so the user can resolve it.
    // I save the current route in SessionStorage to enable auto-return (Boomerang effect).
    const handleJump = (type, itemId) => {
        if (currentPolitistId) {
            const boomerangData = {
                triggerAction: 'reOpenDelete',
                triggerId: currentPolitistId,
                returnRoute: returnRoute
            };
            sessionStorage.setItem('boomerang_pending', JSON.stringify(boomerangData));
        }

        const targetRoute = type === 'Incident' ? '/incidente' : '/amenzi';
        navigate(targetRoute, {
            state: { openEditId: itemId }
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content modal-content-auto" style={{ maxWidth: '600px', width: '90%' }}>

                {/* Header with severity indicator */}
                <div className="modal-header delete-header">
                    <div className="delete-title" style={{ color: statusColor }}>
                        <i className={`${iconClass} delete-icon`}></i>
                        <span style={{ color: 'white' }}>{data.titlu}</span>
                    </div>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="delete-body">
                    <p className="delete-message">{data.mesaj}</p>

                    {/* If dependencies exist, I display them in a scrollable list */}
                    {data.elementeBlocante && data.elementeBlocante.length > 0 && (
                        <div className="blocking-list-container">
                            <h4 className="blocking-title">
                                <i className="fa-solid fa-link" style={{marginRight:'8px'}}></i>
                                Dosare Asociate ({data.elementeBlocante.length})
                            </h4>

                            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                <table className="mini-tactical-table">
                                    <thead>
                                    <tr>
                                        <th>Tip</th>
                                        <th>Status / Detalii</th>
                                        <th style={{ textAlign: 'center' }}>Acțiune</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {data.elementeBlocante.map((item, idx) => {
                                        let detailClass = 'text-success-custom';
                                        // I color-code the text based on status severity
                                        if (item.descriere.includes('Activ') || item.descriere.includes('Neplatita')) {
                                            detailClass = 'text-danger-custom';
                                        } else if (item.descriere.includes('Închis') || item.descriere.includes('Platita')) {
                                            detailClass = 'text-warning-custom';
                                        }

                                        return (
                                            <tr key={idx}>
                                                <td style={{ fontWeight: '700' }}>{item.tip}</td>
                                                <td className={detailClass}>{item.descriere}</td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <button
                                                        onClick={() => handleJump(item.tip, item.id)}
                                                        className="btn-resolve"
                                                        title="Mergi la dosar"
                                                    >
                                                        Rezolvă
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <div className="delete-footer">
                    <button className="btn-close-modal" onClick={onClose}>
                        {data.severitate === 'BLOCKED' ? 'Am înțeles' : 'Anulați'}
                    </button>

                    {/* I only show the delete confirmation button if action is NOT blocked */}
                    {data.severitate !== 'BLOCKED' && (
                        <button className="btn-delete-confirm" onClick={onConfirm}>
                            <i className="fa-solid fa-trash-can" style={{marginRight:'8px'}}></i>
                            Ștergeți
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeleteSmartModal;