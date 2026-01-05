import React from 'react';
import './styles/TableStyles.css';

// Am adaugat prop-ul 'maxWidth' cu o valoare default (null)
const Modal = ({ isOpen, onClose, title, children, maxWidth = null }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            {/* Aplicam maxWidth dinamic daca este trimis */}
            <div
                className="modal-content"
                style={ maxWidth ? { maxWidth: maxWidth, width: '95%' } : {} }
            >

                {/* Header-ul RĂMÂNE FIX sus */}
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                {/* Scroll doar pe body */}
                <div className="modal-body-scroll">
                    {children}
                </div>

            </div>
        </div>
    );
};

export default Modal;