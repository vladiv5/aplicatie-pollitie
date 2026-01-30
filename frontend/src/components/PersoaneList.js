/**
 * Main component for managing the registry of Persons (Citizens).
 * Includes search, pagination, and complex actions (History, Addresses).
 * @author Ivan Vlad-Daniel
 * @version January 11, 2026
 */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Pagination from './Pagination';
import DeleteSmartModal from './DeleteSmartModal';
import toast from 'react-hot-toast';

const PersoaneList = ({
                          refreshTrigger,
                          onAddClick,
                          onEditClick,
                          onViewHistoryClick,
                          onViewAdreseClick,
                          highlightId,
                          onHighlightComplete,
                          setHighlightId
                      }) => {
    const [persoane, setPersoane] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy] = useState('nume'); // Default sort

    const [isLoading, setIsLoading] = useState(true);
    const rowRefs = useRef({});

    // State for Smart Delete
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteData, setDeleteData] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    // I load the list of persons from the backend.
    const loadPersoane = (page, term = '') => {
        setIsLoading(true);
        const token = localStorage.getItem('token');

        let url = `http://localhost:8080/api/persoane/lista-paginata?page=${page}&size=10&sortBy=${sortBy}&dir=asc`;
        if (term) {
            // I encode the search term to avoid issues with special characters.
            const safeTerm = encodeURIComponent(term);
            url = `http://localhost:8080/api/persoane/cauta?termen=${safeTerm}`;
        }

        return axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => {
                if(term) {
                    setPersoane(res.data); // Search returns a flat list
                    setTotalPages(1);
                } else {
                    setPersoane(res.data.content); // Pagination returns a Page object
                    setTotalPages(res.data.totalPages);
                }
                setCurrentPage(page);
                return res.data;
            })
            .catch(err => console.error("Error loading persons:", err))
            .finally(() => {
                setTimeout(() => setIsLoading(false), 200);
            });
    };

    // "Boomerang" Logic: If I return from resolving a blocking incident, I re-open the delete modal.
    useEffect(() => {
        const rawData = sessionStorage.getItem('boomerang_pending');
        if (rawData) {
            const data = JSON.parse(rawData);
            if (data.returnRoute === '/persoane' && data.triggerId) {
                if (data.triggerAction === 'reOpenDelete') {
                    setTimeout(() => {
                        handleRequestDelete(data.triggerId);
                    }, 300);
                }
                if (setHighlightId) {
                    setHighlightId(data.triggerId);
                }
                sessionStorage.removeItem('boomerang_pending');
            }
        }
    }, []);

    // Refresh and Auto-Highlight
    useEffect(() => {
        loadPersoane(currentPage, searchTerm).then((responseData) => {
            if (highlightId) {
                const currentList = responseData.content || responseData;
                if (currentList && Array.isArray(currentList)) {
                    const existsOnPage = currentList.some(p => p.idPersoana === highlightId);
                    if (!existsOnPage) {
                        findPageForId(highlightId);
                    }
                }
            }
        });
    }, [refreshTrigger]);

    const findPageForId = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:8080/api/persoane`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const allData = res.data;
            allData.sort((a, b) => a.nume.localeCompare(b.nume));
            const index = allData.findIndex(p => p.idPersoana === id);

            if (index !== -1) {
                const targetPage = Math.floor(index / 10);
                loadPersoane(targetPage, searchTerm);
            }
        } catch (err) {
            console.error("Could not calculate auto-page:", err);
        }
    };

    // Scroll to highlighted element
    useEffect(() => {
        if (!isLoading && highlightId && rowRefs.current[highlightId]) {
            rowRefs.current[highlightId].scrollIntoView({ behavior: 'smooth', block: 'center' });
            const timer = setTimeout(() => {
                if (onHighlightComplete) onHighlightComplete();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isLoading, persoane, highlightId]);

    const handlePageChange = (newPage) => loadPersoane(newPage, searchTerm);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        loadPersoane(0, val);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        loadPersoane(0, '');
    };

    // Pre-delete check (Smart Delete)
    const handleRequestDelete = (id) => {
        const token = localStorage.getItem('token');
        axios.get(`http://localhost:8080/api/persoane/verifica-stergere/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                setDeleteData(res.data);
                setDeleteId(id);
                setIsDeleteModalOpen(true);
            })
            .catch(() => toast.error("Eroare la verificarea persoanei."));
    };

    const handleConfirmDelete = () => {
        const token = localStorage.getItem('token');
        axios.delete(`http://localhost:8080/api/persoane/${deleteId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(() => {
                loadPersoane(currentPage, searchTerm);
                setIsDeleteModalOpen(false);
                setDeleteId(null);
                setDeleteData(null);
                toast.success("Persoană ștearsă cu succes!");
            })
            .catch(() => toast.error("Eroare la ștergerea persoanei!"));
    };

    const formatDataNasterii = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
    };

    return (
        <div className="page-container">
            <h2 className="page-title">Registru Persoane</h2>

            <div className="controls-container">
                <div className="search-wrapper">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Căutați după nume, prenume sau CNP..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    {searchTerm && (
                        <button className="search-clear-btn" onClick={handleClearSearch}>&times;</button>
                    )}
                </div>

                {!searchTerm && !isLoading && totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                )}

                <button className="add-btn-primary" onClick={onAddClick}>
                    <span>+</span> Adăugați Persoană
                </button>
            </div>

            <div className="table-responsive">
                <table className="styled-table">
                    <thead>
                    <tr>
                        <th>Nume</th>
                        <th>Prenume</th>
                        <th>CNP</th>
                        <th style={{ textAlign: 'center' }}>Data Nașterii</th>
                        <th>Telefon</th>
                        <th style={{textAlign: 'center'}}>Acțiuni</th>
                    </tr>
                    </thead>
                    <tbody>
                    {isLoading ? (
                        <tr><td colSpan="6"><div className="loading-container"><div className="spinner"></div><span>Se încarcă datele...</span></div></td></tr>
                    ) : (
                        persoane && persoane.length > 0 ? (
                            persoane.map((p) => (
                                <tr
                                    key={p.idPersoana}
                                    ref={(el) => (rowRefs.current[p.idPersoana] = el)}
                                    className={highlightId === p.idPersoana ? 'flash-row' : ''}
                                >
                                    <td>{p.nume}</td>
                                    <td>{p.prenume}</td>
                                    <td>{p.cnp}</td>
                                    <td style={{ textAlign: 'center' }}>{formatDataNasterii(p.dataNasterii)}</td>
                                    <td>{p.telefon}</td>
                                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                                        <button className="btn-tactical-teal" onClick={() => onViewHistoryClick(p.idPersoana)} title="Istoric"><i className="fa-solid fa-clock-rotate-left"></i></button>
                                        <button className="btn-tactical-green" onClick={() => onViewAdreseClick(p.idPersoana)} title="Adrese"><i className="fa-solid fa-map-location-dot"></i></button>
                                        <button className="btn-tactical" onClick={() => onEditClick(p.idPersoana)} title="Editați"><i className="fa-solid fa-pen-to-square"></i></button>
                                        <button className="btn-tactical-red" onClick={() => handleRequestDelete(p.idPersoana)} title="Ștergeți"><i className="fa-solid fa-trash"></i></button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" style={{textAlign:'center', padding:'20px'}}>Nu există date.</td></tr>
                        )
                    )}
                    </tbody>
                </table>
            </div>

            <DeleteSmartModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                data={deleteData}
                currentPolitistId={deleteId}
                returnRoute="/persoane"
            />
        </div>
    );
};

export default PersoaneList;