/**
 * Main component for viewing and managing incidents.
 * @author Ivan Vlad-Daniel
 * @version January 11, 2026
 */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Pagination from './Pagination';
import DeleteSmartModal from './DeleteSmartModal';
import toast from 'react-hot-toast';

const IncidenteList = ({
                           refreshTrigger, onAddClick, onEditClick, onViewClick, onManageParticipantsClick,
                           highlightId, onHighlightComplete
                       }) => {
    const [incidente, setIncidente] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const rowRefs = useRef({});

    // State for delete functionality
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteData, setDeleteData] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    // I fetch data from the API, supporting sorting and filtering.
    const loadIncidente = (page, term = '') => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const safeTerm = encodeURIComponent(term); // I prevent errors with special characters

        let url = `http://localhost:8080/api/incidente/lista-paginata?page=${page}&size=10`;
        if (term) url = `http://localhost:8080/api/incidente/cauta?termen=${safeTerm}`;

        return axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => {
                if(term) {
                    setIncidente(res.data);
                    setTotalPages(1);
                } else {
                    setIncidente(res.data.content);
                    setTotalPages(res.data.totalPages);
                }
                setCurrentPage(page);
                return res.data;
            })
            .catch(err => console.error(err))
            .finally(() => {
                setTimeout(() => setIsLoading(false), 200);
            });
    };

    // I handle auto-scrolling to the highlighted item after a refresh.
    useEffect(() => {
        loadIncidente(currentPage, searchTerm).then((responseData) => {
            if (highlightId) {
                // Auto-highlight logic (jump to the right page)
                const currentList = responseData.content || responseData;
                if (currentList && Array.isArray(currentList)) {
                    const existsOnPage = currentList.some(inc => inc.idIncident === highlightId);
                    if (!existsOnPage) {
                        findPageForId(highlightId);
                    }
                }
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshTrigger]);

    const findPageForId = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:8080/api/incidente`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const allData = res.data;
            // I sort descending by date, exactly as in the backend
            allData.sort((a, b) => new Date(b.dataEmitere) - new Date(a.dataEmitere));
            const index = allData.findIndex(inc => inc.idIncident === id);

            if (index !== -1) {
                const targetPage = Math.floor(index / 10);
                loadIncidente(targetPage, searchTerm);
            }
        } catch (err) {
            console.error("Could not calculate auto-page:", err);
        }
    };

    // Scroll and visual highlight
    useEffect(() => {
        if (!isLoading && highlightId && rowRefs.current[highlightId]) {
            rowRefs.current[highlightId].scrollIntoView({ behavior: 'smooth', block: 'center' });
            const timer = setTimeout(() => {
                if (onHighlightComplete) onHighlightComplete();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isLoading, incidente, highlightId]);

    // --- MISSING FUNCTION I ADDED ---
    const handlePageChange = (newPage) => {
        loadIncidente(newPage, searchTerm);
    };

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        loadIncidente(0, val);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        loadIncidente(0, '');
    };

    const handleRequestDelete = (id) => {
        const token = localStorage.getItem('token');
        // I verify if the incident can be deleted (Smart Delete check)
        axios.get(`http://localhost:8080/api/incidente/verifica-stergere/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                setDeleteData(res.data);
                setDeleteId(id);
                setIsDeleteModalOpen(true);
            })
            .catch(() => toast.error("Eroare la verificarea incidentului."));
    };

    const handleConfirmDelete = () => {
        const token = localStorage.getItem('token');
        axios.delete(`http://localhost:8080/api/incidente/${deleteId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(() => {
                loadIncidente(currentPage, searchTerm);
                setIsDeleteModalOpen(false);
                setDeleteData(null);
                setDeleteId(null);
                toast.success("Incidentul a fost șters!");
            })
            .catch(() => toast.error("Eroare la ștergere!"));
    };

    return (
        <div className="page-container">
            <h2 className="page-title">Registru Incidente</h2>

            <div className="controls-container">
                <div className="search-wrapper">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Căutați după tipul incidentului sau polițist..."
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

                <button className="add-btn-primary" onClick={onAddClick}><span>+</span> Adăugați Incident</button>
            </div>

            <div className="table-responsive">
                <table className="styled-table">
                    <thead>
                    <tr>
                        <th>Tip</th>
                        <th>Stare</th>
                        <th>Data & Ora</th>
                        <th>Locație</th>
                        <th>Adresă</th>
                        <th>Polițist</th>
                        <th style={{textAlign:'center'}}>Acțiuni</th>
                    </tr>
                    </thead>
                    <tbody>
                    {isLoading ? (
                        <tr><td colSpan="7"><div className="loading-container"><div className="spinner"></div><span>Se încarcă datele...</span></div></td></tr>
                    ) : (
                        incidente && incidente.length > 0 ? (
                            incidente.map((inc) => (
                                <tr
                                    key={inc.idIncident}
                                    ref={(el) => (rowRefs.current[inc.idIncident] = el)}
                                    className={highlightId === inc.idIncident ? 'flash-row' : ''}
                                >
                                    <td style={{fontWeight: '500'}}>{inc.tipIncident}</td>
                                    <td><span className="badge-status">{inc.status || 'Activ'}</span></td>
                                    <td>{inc.dataEmitere ? new Date(inc.dataEmitere).toLocaleString('ro-RO').substring(0, 17) : ''}</td>
                                    <td>{inc.descriereLocatie}</td>
                                    <td>{inc.adresaIncident ? `${inc.adresaIncident.strada} ${inc.adresaIncident.numar}` : ''}</td>
                                    <td>{inc.politistResponsabil ? `${inc.politistResponsabil.nume} ${inc.politistResponsabil.prenume}` : ''}</td>
                                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                                        <button className="btn-tactical-teal" onClick={() => onViewClick(inc)} title="Detalii"><i className="fa-solid fa-eye"></i></button>
                                        <button className="btn-tactical-purple" onClick={() => onManageParticipantsClick(inc.idIncident)} title="Participanți"><i className="fa-solid fa-users"></i></button>
                                        <button className="btn-tactical" onClick={() => onEditClick(inc.idIncident)} title="Editați"><i className="fa-solid fa-pen-to-square"></i></button>
                                        <button className="btn-tactical-red" onClick={() => handleRequestDelete(inc.idIncident)} title="Ștergeți"><i className="fa-solid fa-trash"></i></button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="7" style={{textAlign:'center', padding:'20px'}}>Nu există incidente.</td></tr>
                        )
                    )}
                    </tbody>
                </table>
            </div>

            <DeleteSmartModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} data={deleteData} />
        </div>
    );
};

export default IncidenteList;