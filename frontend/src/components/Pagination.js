/** Componenta de Paginare pentru tabelele principale
 * Include navigare pagina cu pagina si "Go To Page"
 * @author Ivan Vlad-Daniel
 * @version 11 ianuarie 2026
 */
import React, { useState, useEffect } from 'react';
import toast from "react-hot-toast";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const [inputPage, setInputPage] = useState('');

    useEffect(() => {
        setInputPage(currentPage + 1);
    }, [currentPage]);

    const handleInputChange = (e) => setInputPage(e.target.value);

    const handleGoToPage = () => {
        const pageNumber = parseInt(inputPage, 10);
        if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
            onPageChange(pageNumber - 1);
        } else {
            setInputPage(currentPage + 1);
            toast.error(`Vă rog introduceți o pagină validă (1 - ${totalPages})`);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleGoToPage();
    };

    if (totalPages <= 1) return null;

    return (
        <div className="pagination-container">
            <div className="pagination-bar">
                <button className="pag-btn" disabled={currentPage === 0} onClick={() => onPageChange(currentPage - 1)} title="Pagina Anterioară">
                    <i className="fa-solid fa-chevron-left"></i>
                </button>

                <span className="pagination-info">Pagina <b>{currentPage + 1}</b> din <b>{totalPages}</b></span>

                <button className="pag-btn" disabled={currentPage + 1 >= totalPages} onClick={() => onPageChange(currentPage + 1)} title="Pagina Următoare">
                    <i className="fa-solid fa-chevron-right"></i>
                </button>

                <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)', margin: '0 5px' }}></div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="number" className="pag-input" value={inputPage} onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder="#" />
                    <button className="pag-go-btn" onClick={handleGoToPage}>GO</button>
                </div>
            </div>
        </div>
    );
};

export default Pagination;