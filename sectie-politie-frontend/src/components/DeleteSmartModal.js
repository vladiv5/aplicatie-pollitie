/** Componenta Critica pentru sistemul de Stergere Inteligenta
 * Analizeaza dependintele (Amenzi, Incidente) si decide daca permite stergerea
 * Implementeaza logica 'Bumerang' pentru navigare rapida catre elementele blocante
 * @author Ivan Vlad-Daniel
 * @version 11 ianuarie 2026
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/TableStyles.css';

const DeleteSmartModal = ({ isOpen, onClose, onConfirm, data, currentPolitistId, returnRoute = '/politisti' }) => {
    const navigate = useNavigate();

    if (!isOpen || !data) return null;

    // Definesc culorile vizuale in functie de severitatea primita din Backend
    let statusColor = '#10b981'; // Verde (SAFE)
    let iconClass = 'fa fa-check-circle';

    if (data.severitate === 'WARNING') {
        statusColor = '#f59e0b'; // Portocaliu (Exista istoric, dar se poate sterge)
        iconClass = 'fa fa-exclamation-triangle';
    } else if (data.severitate === 'BLOCKED') {
        statusColor = '#ef4444'; // Rosu (Interzis stergerea)
        iconClass = 'fa fa-ban';
    }

    // Functie pentru navigarea la elementul care blocheaza stergerea
    // Salvez in SessionStorage ruta curenta pentru a ma putea intoarce automat (Bumerang)
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

                {/* Header cu indicator de severitate */}
                <div className="modal-header delete-header">
                    <div className="delete-title" style={{ color: statusColor }}>
                        <i className={`${iconClass} delete-icon`}></i>
                        <span style={{ color: 'white' }}>{data.titlu}</span>
                    </div>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="delete-body">
                    <p className="delete-message">{data.mesaj}</p>

                    {/* Daca exista dependente, le afisez intr-un tabel mic */}
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
                                        // Colorez textul in functie de gravitatea statusului
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

                    {/* Butonul de stergere apare DOAR daca nu este BLOCKED */}
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