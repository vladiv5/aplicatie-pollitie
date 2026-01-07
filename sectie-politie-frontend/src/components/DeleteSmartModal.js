import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/TableStyles.css';
// Asigură-te că Forms.css este importat undeva în aplicație (de obicei în index.js sau App.js)
// Dacă nu, poți adăuga: import './styles/Forms.css'; aici.

const DeleteSmartModal = ({ isOpen, onClose, onConfirm, data, currentPolitistId, returnRoute = '/politisti' }) => {
    const navigate = useNavigate();

    if (!isOpen || !data) return null;

    // Determinăm culorile DOAR pentru text/iconițe, nu fundaluri
    let statusColor = '#10b981'; // Verde (Succes/Safe)
    let iconClass = 'fa fa-check-circle';

    if (data.severitate === 'WARNING') {
        statusColor = '#f59e0b'; // Portocaliu (Amber)
        iconClass = 'fa fa-exclamation-triangle';
    } else if (data.severitate === 'BLOCKED') {
        statusColor = '#ef4444'; // Roșu
        iconClass = 'fa fa-ban';
    }

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
            {/* Folosim clasa standard modal-content + stiluri specifice */}
            <div className="modal-content modal-content-auto" style={{ maxWidth: '600px', width: '90%' }}>

                {/* HEADER: Navy Background cu Accent Auriu + Iconiță Colorată */}
                <div className="modal-header delete-header">
                    <div className="delete-title" style={{ color: statusColor }}>
                        <i className={`${iconClass} delete-icon`}></i>
                        <span style={{ color: 'white' }}>{data.titlu}</span>
                    </div>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                {/* BODY: Clean & Professional */}
                <div className="delete-body">
                    <p className="delete-message">
                        {data.mesaj}
                    </p>

                    {/* Lista Blocantă */}
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
                                        // Logică culori text în funcție de status
                                        let detailClass = 'text-success-custom';
                                        if (item.descriere.includes('Activ') || item.descriere.includes('Neplatita')) {
                                            detailClass = 'text-danger-custom';
                                        } else if (item.descriere.includes('Închis') || item.descriere.includes('Platita')) {
                                            detailClass = 'text-warning-custom';
                                        }

                                        return (
                                            <tr key={idx}>
                                                <td style={{ fontWeight: '700' }}>{item.tip}</td>
                                                <td className={detailClass}>
                                                    {item.descriere}
                                                </td>
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

                {/* FOOTER: Butoane Premium */}
                <div className="delete-footer">
                    {/* Buton Anulare (Stil Gri/Navy din Forms.css) */}
                    <button
                        className="btn-close-modal"
                        onClick={onClose}
                    >
                        {data.severitate === 'BLOCKED' ? 'Am înțeles' : 'Anulați'}
                    </button>

                    {/* Buton Ștergere (Doar dacă nu e blocat) - Roșu Premium */}
                    {data.severitate !== 'BLOCKED' && (
                        <button
                            className="btn-delete-confirm"
                            onClick={onConfirm}
                        >
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