import React, { useState, useEffect } from 'react'; // <--- IMPORTAM useEffect
import './styles/Statistici.css';

const PaginatedCard = ({ title, icon, colorClass, data, renderItem, itemsPerPage = 6, description }) => {
    const [page, setPage] = useState(0);

    // --- FIX: RESETARE PAGINĂ CÂND SE SCHIMBĂ DATELE ---
    // Când utilizatorul aplică un filtru nou, 'data' se schimbă.
    // Acest useEffect forțează revenirea la pagina 0 (prima pagină).
    useEffect(() => {
        setPage(0);
    }, [data]);
    // ----------------------------------------------------

    // Empty state
    if (!data || data.length === 0) {
        return (
            <div className={`st-paginated-card ${colorClass}`}>
                <div className="st-card-header">
                    <div className="st-card-title-wrapper">
                        <span>{icon}</span>
                        <h3>{title}</h3>
                        {description && <div className="st-card-header-tooltip">{description}</div>}
                    </div>
                </div>
                <div className="st-empty-state">Nu există date disponibile pentru perioada selectată.</div>
            </div>
        );
    }

    const totalPages = Math.ceil(data.length / itemsPerPage);

    const prevPage = () => setPage((curr) => (curr - 1 + totalPages) % totalPages);
    const nextPage = () => setPage((curr) => (curr + 1) % totalPages);

    const currentData = data.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

    return (
        <div className={`st-paginated-card ${colorClass}`}>
            {/* Header */}
            <div className="st-card-header">
                <div className="st-card-title-wrapper">
                    <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                    <h3>{title}</h3>
                    {description && (
                        <div className="st-card-header-tooltip">
                            {description}
                        </div>
                    )}
                </div>
            </div>

            {/* Content Table */}
            <div className="st-card-content-relative">
                <table className="st-fixed-height-table">
                    <tbody>
                    {currentData.map((item, index) => renderItem(item, index + (page * itemsPerPage)))}
                    </tbody>
                </table>

                {/* Navigare Laterala */}
                {totalPages > 1 && (
                    <>
                        <button className="st-nav-circle-absolute left" onClick={prevPage}>&#10094;</button>
                        <button className="st-nav-circle-absolute right" onClick={nextPage}>&#10095;</button>
                    </>
                )}
            </div>

            {/* Footer */}
            <div className="st-page-counter">
                Pagina {page + 1} din {totalPages}
            </div>
        </div>
    );
};

export default PaginatedCard;