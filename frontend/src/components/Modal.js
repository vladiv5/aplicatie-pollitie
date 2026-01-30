/**
 * Base component for modal windows (pop-ups).
 * @author Ivan Vlad-Daniel
 * @version January 11, 2026
 */
import React from 'react';
import './styles/TableStyles.css';

const Modal = ({ isOpen, onClose, title, children, maxWidth = null }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            {/* I allow custom width for larger modals (e.g., ViewLocatari) */}
            <div
                className="modal-content"
                style={ maxWidth ? { maxWidth: maxWidth, width: '95%' } : {} }
            >
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                {/* Scrollable area for long content */}
                <div className="modal-body-scroll">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;