import React, { useState } from 'react';

const PaginatedCard = ({ title, icon, data, renderItem, itemsPerPage = 5, description, colorClass }) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(data.length / itemsPerPage);
    // Dacă nu sunt date, considerăm 1 pagină pentru a evita erorile
    const safeTotalPages = totalPages > 0 ? totalPages : 1;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = data.slice(startIndex, startIndex + itemsPerPage);

    // LOGICA CIRCULARA
    const handlePrev = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        } else {
            setCurrentPage(safeTotalPages); // De la 1 sari la ultima
        }
    };

    const handleNext = () => {
        if (currentPage < safeTotalPages) {
            setCurrentPage(prev => prev + 1);
        } else {
            setCurrentPage(1); // De la ultima sari la 1
        }
    };

    return (
        <div className={`st-paginated-card ${colorClass || ''}`}>
            {/* Header */}
            <div className="st-card-header">
                <div className="st-icon-container">
                    {/* Aici va fi randat tag-ul <i> trimis din părinte */}
                    {icon}
                </div>
                <div>
                    <h3>{title}</h3>
                    {description && <p>{description}</p>}
                </div>
            </div>

            {/* Content Tabel */}
            <div className="st-card-content-relative">
                <table className="st-fixed-height-table">
                    <tbody>
                    {currentData.length > 0 ? (
                        currentData.map((item, idx) => renderItem(item, idx))
                    ) : (
                        <tr>
                            <td colSpan="2" style={{ textAlign: 'center', color: '#aaa' }}>
                                Nu există date.
                            </td>
                        </tr>
                    )}
                    {/* Umplem rândurile goale pentru a păstra dimensiunea fixă */}
                    {Array.from({ length: Math.max(0, itemsPerPage - currentData.length) }).map((_, idx) => (
                        <tr key={`empty-${idx}`} className="st-empty-row">
                            <td>&nbsp;</td>
                            <td>&nbsp;</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Footer Paginare */}
            <div className="st-page-counter">
                <span className="st-page-text">
                    Pagina {currentPage} din {safeTotalPages}
                </span>

                <div className="st-pagination-controls">
                    {/* Am scos atributul 'disabled' pentru a permite circulația */}
                    <button className="st-card-nav-btn" onClick={handlePrev}>
                        <i className="fa-solid fa-chevron-left"></i>
                    </button>

                    <button className="st-card-nav-btn" onClick={handleNext}>
                        <i className="fa-solid fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaginatedCard;