import React, { useState } from 'react';
import './styles/PaginatedCard.css';

const PaginatedCard = ({ title, icon, colorClass, data, renderItem, itemsPerPage = 6 }) => {
    const [page, setPage] = useState(0);

    // Guard clause: Fără date
    if (!data || data.length === 0) {
        return (
            <div className={`pc-card ${colorClass}`}>
                <div className="pc-header">
                    <span>{icon}</span>
                    <h3>{title}</h3>
                </div>
                <div className="pc-empty">Nu există date de afișat.</div>
            </div>
        );
    }

    const totalPages = Math.ceil(data.length / itemsPerPage);

    const prevPage = () => {
        setPage((curr) => (curr - 1 + totalPages) % totalPages);
    };

    const nextPage = () => {
        setPage((curr) => (curr + 1) % totalPages);
    };

    const currentData = data.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

    return (
        <div className={`pc-card ${colorClass}`}>

            {/* HEADER */}
            <div className="pc-header">
                <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                <h3>{title}</h3>
            </div>

            {/* --- BUTOANELE SUNT ACUM DIRECT PE CARD (PENTRU POZITIE FIXA) --- */}
            {totalPages > 1 && (
                <>
                    <button className="pc-nav-btn pc-prev" onClick={prevPage}>
                        &#10094;
                    </button>
                    <button className="pc-nav-btn pc-next" onClick={nextPage}>
                        &#10095;
                    </button>
                </>
            )}

            {/* CONTENT AREA (DOAR TABELUL) */}
            <div className="pc-content">
                <table className="pc-table">
                    <tbody key={page} className="pc-animate-enter">
                    {currentData.map((item, index) => renderItem(item, index + (page * itemsPerPage)))}
                    </tbody>
                </table>
            </div>

            {/* NUMAR PAGINA */}
            <div className="pc-page-indicator">
                Pagina {page + 1} din {totalPages}
            </div>
        </div>
    );
};

export default PaginatedCard;