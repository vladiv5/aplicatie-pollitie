import React, { useState, useEffect } from 'react';
import './styles/Pagination.css';
import toast from "react-hot-toast";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
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

    // Handler pentru "Go"
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

    return (
        <div className="pagination-container">
            {/* Buton Previous */}
            <button
                className="page-btn"
                disabled={currentPage === 0}
                onClick={() => onPageChange(currentPage - 1)}
            >
                &#8592; Anterior
            </button>

            {/* Zona de Info si Input */}
            <div className="pagination-jump">
                <span className="page-label">Pagina</span>
                <input
                    type="number"
                    className="page-input"
                    value={inputPage}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    min="1"
                    max={totalPages}
                />
                <span className="page-label">din {totalPages}</span>
                <button className="go-btn" onClick={handleGoToPage}>Go</button>
            </div>

            {/* Buton Next */}
            <button
                className="page-btn"
                disabled={currentPage + 1 >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
            >
                Următor &#8594;
            </button>
        </div>
    );
};

export default Pagination;