/** Componenta Card Paginat pentru Dashboard
 * Afiseaza liste mici (Top Politisti, Zone Critice) cu navigare interna
 * @author Ivan Vlad-Daniel
 * @version 11 ianuarie 2026
 */
import React, { useState } from 'react';

const PaginatedCard = ({ title, icon, data, renderItem, itemsPerPage = 5, description, colorClass }) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(data.length / itemsPerPage);
    const safeTotalPages = totalPages > 0 ? totalPages : 1;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = data.slice(startIndex, startIndex + itemsPerPage);

    // Navigare circulara (Infinite Loop)
    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
        else setCurrentPage(safeTotalPages);
    };

    const handleNext = () => {
        if (currentPage < safeTotalPages) setCurrentPage(prev => prev + 1);
        else setCurrentPage(1);
    };

    return (
        <div className={`st-paginated-card ${colorClass || ''}`}>
            <div className="st-card-header">
                <div className="st-icon-container">{icon}</div>
                <div>
                    <h3>{title}</h3>
                    {description && <p>{description}</p>}
                </div>
            </div>

            <div className="st-card-content-relative">
                <table className="st-fixed-height-table">
                    <tbody>
                    {currentData.length > 0 ? (
                        currentData.map((item, idx) => renderItem(item, idx))
                    ) : (
                        <tr><td colSpan="2" style={{ textAlign: 'center', color: '#aaa' }}>Nu există date.</td></tr>
                    )}
                    {/* Umplere spatiu gol pentru a mentine inaltimea constanta */}
                    {Array.from({ length: Math.max(0, itemsPerPage - currentData.length) }).map((_, idx) => (
                        <tr key={`empty-${idx}`} className="st-empty-row"><td>&nbsp;</td><td>&nbsp;</td></tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <div className="st-page-counter">
                <span className="st-page-text">Pagina {currentPage} din {safeTotalPages}</span>
                <div className="st-pagination-controls">
                    <button className="st-card-nav-btn" onClick={handlePrev}><i className="fa-solid fa-chevron-left"></i></button>
                    <button className="st-card-nav-btn" onClick={handleNext}><i className="fa-solid fa-chevron-right"></i></button>
                </div>
            </div>
        </div>
    );
};

export default PaginatedCard;