import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Pagination from './Pagination';
import DeleteSmartModal from './DeleteSmartModal';
import './styles/TableStyles.css';
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
    const [sortBy] = useState('nume');

    const rowRefs = useRef({});

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteData, setDeleteData] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const loadPersoane = (page, term = '') => {
        const token = localStorage.getItem('token');
        let url = `http://localhost:8080/api/persoane/lista-paginata?page=${page}&size=10&sortBy=${sortBy}&dir=asc`;
        if (term) url = `http://localhost:8080/api/persoane/cauta?termen=${term}`;

        return axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => {
                if(term) {
                    setPersoane(res.data);
                    setTotalPages(1);
                } else {
                    setPersoane(res.data.content);
                    setTotalPages(res.data.totalPages);
                }
                setCurrentPage(page);
                return res.data;
            })
            .catch(err => console.error("Eroare incarcare persoane:", err));
    };

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

    useEffect(() => {
        loadPersoane(currentPage, searchTerm).then((responseData) => {
            if (highlightId) {
                const currentList = responseData.content || responseData;
                if (currentList) {
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
                if (targetPage !== currentPage) {
                    loadPersoane(targetPage, searchTerm);
                } else {
                    loadPersoane(currentPage, searchTerm);
                }
            }
        } catch (err) {
            console.error("Nu am putut calcula pagina automata:", err);
        }
    };

    useEffect(() => {
        if (highlightId && rowRefs.current[highlightId]) {
            rowRefs.current[highlightId].scrollIntoView({ behavior: 'smooth', block: 'center' });
            const timer = setTimeout(() => {
                if (onHighlightComplete) onHighlightComplete();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [persoane, highlightId]);

    const handlePageChange = (newPage) => loadPersoane(newPage, searchTerm);

    // --- MODIFICARE 1: Search ---
    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        loadPersoane(0, val);
    };

    // --- MODIFICARE 2: Clear ---
    const handleClearSearch = () => {
        setSearchTerm('');
        loadPersoane(0, '');
    };

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
            .catch(err => {
                toast.error("Eroare la verificarea persoanei.");
            });
    };

    const handleConfirmDelete = () => {
        const token = localStorage.getItem('token');
        axios.delete(`http://localhost:8080/api/persoane/${deleteId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then((res) => {
                loadPersoane(currentPage, searchTerm);
                setIsDeleteModalOpen(false);
                setDeleteId(null);
                setDeleteData(null);
                toast.success("Persoană ștearsă cu succes!");
            })
            .catch(err => toast.error("Eroare la ștergerea persoanei!"));
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
                {/* --- MODIFICARE 3: Wrapper --- */}
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
                {/* ----------------------------- */}

                <button className="add-btn-primary" onClick={onAddClick}>
                    <span>+</span> Adăugați Persoană
                </button>
            </div>

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
                {persoane && persoane.length > 0 ? (
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
                            <td>
                                <div className="action-buttons-container" style={{justifyContent:'center'}}>
                                    <button className="action-btn edit-btn" onClick={() => onEditClick(p.idPersoana)}>Editați</button>

                                    <button className="action-btn delete-btn" onClick={() => handleRequestDelete(p.idPersoana)}>Ștergeți</button>

                                    <button className="action-btn"
                                            style={{ backgroundColor: '#17a2b8', color: 'white', marginRight: '5px' }}
                                            onClick={() => onViewHistoryClick(p.idPersoana)}
                                            title="Vizualizați Istoric"
                                    >
                                        <i className="fa fa-history"></i> Istoric
                                    </button>

                                    <button className="action-btn"
                                            style={{ backgroundColor: '#28a745', color: 'white', marginRight: '5px' }}
                                            onClick={() => onViewAdreseClick(p.idPersoana)}
                                            title="Vizualizați Adrese"
                                    >
                                        <i className="fa fa-home"></i> Adrese
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))) : (
                    <tr><td colSpan="6" style={{textAlign:'center', padding:'20px'}}>Nu există date.</td></tr>
                )}
                </tbody>
            </table>

            {!searchTerm && totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            )}

            <DeleteSmartModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                data={deleteData}
                currentPolitistId={deleteId}
                returnRoute="/persoane" // RUTA CORECTĂ
            />
        </div>
    );
};

export default PersoaneList;