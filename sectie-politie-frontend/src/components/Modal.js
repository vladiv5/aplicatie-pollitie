/** Componenta de baza pentru ferestre modale (pop-up)
 * @author Ivan Vlad-Daniel
 * @version 11 ianuarie 2026
 */
import React from 'react';
import './styles/TableStyles.css';

const Modal = ({ isOpen, onClose, title, children, maxWidth = null }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            {/* Permitem latime personalizata pentru modale mari (ex: ViewLocatari) */}
            <div
                className="modal-content"
                style={ maxWidth ? { maxWidth: maxWidth, width: '95%' } : {} }
            >
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                {/* Zona scrollabila pentru continut lung */}
                <div className="modal-body-scroll">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;