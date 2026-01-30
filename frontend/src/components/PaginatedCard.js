/**
 * Component for Dashboard Paginated Cards.
 * Displays small lists (Top Officers, Critical Zones) with internal navigation.
 * @author Ivan Vlad-Daniel
 * @version January 11, 2026
 */
import React, { useState } from 'react';

const PaginatedCard = ({ title, icon, data, renderItem, itemsPerPage = 5, description, colorClass }) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(data.length / itemsPerPage);
    const safeTotalPages = totalPages > 0 ? totalPages : 1;

    // I calculate the slice of data to display for the current page.
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = data.slice(startIndex, startIndex + itemsPerPage);

    // I implemented circular navigation (Infinite Loop) for better UX.
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
                    {/* I fill empty space with invisible rows to maintain constant card height */}
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