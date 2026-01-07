import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
// import { useLocation, useNavigate } from 'react-router-dom';
import Pagination from './Pagination';
import DeleteSmartModal from './DeleteSmartModal';
import toast from 'react-hot-toast';

const PolitistiList = ({
                           refreshTrigger,
                           onAddClick,
                           onEditClick,
                           highlightId,
                           onHighlightComplete,
                           setHighlightId
                       }) => {
    // --- STATE ---
    const [politisti, setPolitisti] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('nume');

    // --- LOADING STATE ---
    const [isLoading, setIsLoading] = useState(true);

    const rowRefs = useRef({});

    // --- DELETE STATE ---
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteData, setDeleteData] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    // --- LOAD DATA ---
    const loadPolitisti = (pageArg, termArg) => {
        setIsLoading(true);

        const token = localStorage.getItem('token');
        const page = (pageArg !== undefined) ? pageArg : currentPage;
        const term = (termArg !== undefined) ? termArg : searchTerm;

        let url = `http://localhost:8080/api/politisti/lista-paginata?page=${page}&size=10&sortBy=${sortBy}&dir=asc`;

        if (term) {
            url = `http://localhost:8080/api/politisti/cauta?termen=${term}`;
        }

        return axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => {
                if(term) {
                    setPolitisti(res.data);
                    setTotalPages(1);
                } else {
                    setPolitisti(res.data.content);
                    setTotalPages(res.data.totalPages);
                }
                setCurrentPage(page);
                return res.data;
            })
            .catch(err => console.error("Eroare incarcare:", err))
            .finally(() => {
                setTimeout(() => setIsLoading(false), 200);
            });
    };

    // =========================================================
    // LOGICA BUMERANG V2
    // =========================================================
    useEffect(() => {
        const rawData = sessionStorage.getItem('boomerang_pending');
        if (rawData) {
            const data = JSON.parse(rawData);
            if (data.returnRoute === '/politisti' && data.triggerId) {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- REFRESH + AUTO JUMP LOGIC ---
    useEffect(() => {
        loadPolitisti(currentPage, searchTerm).then((responseData) => {
            if (highlightId) {
                const currentList = responseData.content || responseData;
                if (currentList) {
                    const existsOnPage = currentList.some(p => p.idPolitist === highlightId);
                    if (!existsOnPage) {
                        findPageForId(highlightId);
                    }
                }
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshTrigger]);

    // --- LOGICA DE CĂUTARE A PAGINII ---
    const findPageForId = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:8080/api/politisti/toata-lista`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const allData = res.data;
            allData.sort((a, b) => a.nume.localeCompare(b.nume));
            const index = allData.findIndex(p => p.idPolitist === id);

            if (index !== -1) {
                const targetPage = Math.floor(index / 10);
                if (targetPage !== currentPage) {
                    loadPolitisti(targetPage, searchTerm);
                } else {
                    loadPolitisti(currentPage, searchTerm);
                }
            }
        } catch (err) {
            console.error("Nu am putut calcula pagina automata:", err);
        }
    };

    // --- EFFECT: SCROLL & FLASH ---
    useEffect(() => {
        if (!isLoading && highlightId && rowRefs.current[highlightId]) {
            rowRefs.current[highlightId].scrollIntoView({ behavior: 'smooth', block: 'center' });
            const timer = setTimeout(() => {
                if (onHighlightComplete) onHighlightComplete();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isLoading, politisti, highlightId]);

    // --- HANDLERS STANDARD ---
    const handlePageChange = (newPage) => loadPolitisti(newPage, searchTerm);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        loadPolitisti(0, val);
    };

    const handleRequestDelete = (id) => {
        const token = localStorage.getItem('token');
        axios.get(`http://localhost:8080/api/politisti/verifica-stergere/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => {
            setDeleteData(res.data);
            setDeleteId(id);
            setIsDeleteModalOpen(true);
        }).catch(() => toast.error("Eroare la verificarea polițistului."));
    };

    const handleConfirmDelete = () => {
        const token = localStorage.getItem('token');
        axios.delete(`http://localhost:8080/api/politisti/${deleteId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(() => {
            loadPolitisti(currentPage, searchTerm);
            setIsDeleteModalOpen(false);
            setDeleteId(null);
            setDeleteData(null);
            toast.success("Polițist șters cu succes!");
        }).catch(() => toast.error("Eroare la ștergere!"));
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setDeleteData(null);
        setDeleteId(null);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        loadPolitisti(0, '');
    };

    return (
        <div className="page-container">
            <h2 className="page-title">Gestiune Polițiști</h2>

            <div className="controls-container">
                {/* 1. SEARCH */}
                <div className="search-wrapper">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Căutați după nume..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    {searchTerm && (
                        <button className="search-clear-btn" onClick={handleClearSearch}>&times;</button>
                    )}
                </div>

                {/* 2. PAGINARE MUTATĂ AICI */}
                {!searchTerm && !isLoading && totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                )}

                {/* 3. BUTON ADĂUGARE */}
                <button className="add-btn-primary" onClick={onAddClick}><span>+</span> Adăugați Polițist</button>
            </div>

            <div className="table-responsive">
                <table className="styled-table">
                    <thead>
                    <tr>
                        <th>Nume</th>
                        <th>Prenume</th>
                        <th>Grad</th>
                        <th>Funcție</th>
                        <th>Telefon</th>
                        <th>Acțiuni</th>
                    </tr>
                    </thead>
                    <tbody>

                    {isLoading ? (
                        <tr>
                            <td colSpan="6">
                                <div className="loading-container">
                                    <div className="spinner"></div>
                                    <span>Se încarcă datele...</span>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        politisti && politisti.length > 0 ? (
                            politisti.map(politist => (
                                <tr
                                    key={politist.idPolitist}
                                    ref={(el) => (rowRefs.current[politist.idPolitist] = el)}
                                    className={highlightId === politist.idPolitist ? 'flash-row' : ''}
                                >
                                    <td>{politist.nume}</td>
                                    <td>{politist.prenume}</td>
                                    <td>{politist.grad}</td>
                                    <td>{politist.functie}</td>
                                    <td>{politist.telefon_serviciu}</td>

                                    <td style={{ textAlign: 'center' }}>
                                        <button
                                            className="btn-tactical"
                                            onClick={() => onEditClick(politist.idPolitist)}
                                            title="Editați Polițist"
                                        >
                                            <i className="fa-solid fa-pen-to-square"></i>
                                        </button>

                                        <button
                                            className="btn-tactical-red"
                                            onClick={() => handleRequestDelete(politist.idPolitist)}
                                            title="Ștergeți Polițist"
                                        >
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" style={{textAlign: 'center'}}>Nu au fost găsite înregistrări.</td></tr>
                        )
                    )}
                    </tbody>
                </table>
            </div>

            {/* Paginarea a fost ștearsă de aici */}

            <DeleteSmartModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                data={deleteData}
                currentPolitistId={deleteId}
                returnRoute="/politisti"
            />
        </div>
    );
};

export default PolitistiList;