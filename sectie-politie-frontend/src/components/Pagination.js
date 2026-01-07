import React, { useState, useEffect } from 'react';
// import './styles/Pagination.css'; // NU mai avem nevoie, stilurile sunt acum globale în index.css
import toast from "react-hot-toast";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    // --- PĂSTRĂM LOGICA TA VECHE INTACTĂ ---

    // State local pentru inputul "Mergi la pagina"
    const [inputPage, setInputPage] = useState('');

    // Actualizam input-ul cand se schimba pagina extern (ex: dai Next)
    useEffect(() => {
        setInputPage(currentPage + 1);
    }, [currentPage]);

    // Handler pentru input
    const handleInputChange = (e) => {
        setInputPage(e.target.value);
    };

    // Handler pentru "Go" (Logica ta de validare + Toast)
    const handleGoToPage = () => {
        const pageNumber = parseInt(inputPage, 10);

        // Validare: Sa fie numar, sa fie >= 1 si sa fie <= totalPages
        if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
            // Backend vrea index de la 0, deci scadem 1
            onPageChange(pageNumber - 1);
        } else {
            // Daca a scris prostii, resetam la pagina curenta
            setInputPage(currentPage + 1);
            toast.error(`Vă rog introduceți o pagină validă (1 - ${totalPages})`);
        }
    };

    // Handler pentru tasta Enter
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleGoToPage();
        }
    };

    if (totalPages <= 1) return null;

    // --- SCHIMBĂM DOAR DESIGN-UL (JSX) ---
    return (
        <div className="pagination-container">
            <div className="pagination-bar">

                {/* Buton Anterior (Acum cu iconiță) */}
                <button
                    className="pag-btn"
                    disabled={currentPage === 0}
                    onClick={() => onPageChange(currentPage - 1)}
                    title="Pagina Anterioară"
                >
                    <i className="fa-solid fa-chevron-left"></i>
                </button>

                {/* Text Info (Pagina X din Y) */}
                <span className="pagination-info">
                    Pagina <b>{currentPage + 1}</b> din <b>{totalPages}</b>
                </span>

                {/* Buton Următor (Acum cu iconiță) */}
                <button
                    className="pag-btn"
                    disabled={currentPage + 1 >= totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    title="Pagina Următoare"
                >
                    <i className="fa-solid fa-chevron-right"></i>
                </button>

                {/* Separator vizual */}
                <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)', margin: '0 5px' }}></div>

                {/* Zona de Input "Go To" */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                        type="number"
                        className="pag-input"
                        value={inputPage}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="#"
                    />
                    <button className="pag-go-btn" onClick={handleGoToPage}>
                        GO
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Pagination;