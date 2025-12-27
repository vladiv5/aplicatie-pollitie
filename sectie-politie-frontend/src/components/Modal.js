import React from 'react';
import './styles/TableStyles.css'; // Importăm stilurile

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null; // Dacă nu e deschis, nu afișăm nimic

    return (
        <div className="modal-overlay">
            <div className="modal-content">

                {/* Header cu Titlu și X */}
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                {/* Aici vine formularul (AddPolitist, AddIncident, etc.) */}
                <div className="modal-body">
                    {children}
                </div>

            </div>
        </div>
    );
};

export default Modal;