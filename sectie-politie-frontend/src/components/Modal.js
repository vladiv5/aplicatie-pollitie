import React from 'react';
import './styles/TableStyles.css';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            {/* Modal Content are acum max-height: 80vh */}
            <div className="modal-content">

                {/* Header-ul RĂMÂNE FIX sus */}
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                {/* DOAR AICI apare scroll-ul dacă e prea lung */}
                <div className="modal-body-scroll">
                    {children}
                </div>

            </div>
        </div>
    );
};

export default Modal;