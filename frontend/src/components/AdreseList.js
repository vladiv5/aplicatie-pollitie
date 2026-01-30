/**
 * Main component for displaying and managing the address registry.
 * Includes pagination, search, and CRUD actions.
 * @author Ivan Vlad-Daniel
 * @version January 11, 2026
 */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Pagination from './Pagination';
import DeleteSmartModal from './DeleteSmartModal';
import toast from 'react-hot-toast';
import Modal from './Modal';
import ViewLocatariAdresa from './ViewLocatariAdresa';

const AdreseList = ({
                        refreshTrigger,
                        onAddClick,
                        onEditClick,
                        highlightId,
                        onHighlightComplete,
                        setHighlightId // IMPORTANT: I receive the setter to manage state lift-up.
                    }) => {
    const [adrese, setAdrese] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const rowRefs = useRef({});

    // --- State for Smart Delete Modal ---
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteData, setDeleteData] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    // --- State for viewing residents ---
    const [viewLocatariId, setViewLocatariId] = useState(null);

    // I load data from the server, handling both pagination and search scenarios.
    const loadAdrese = (page, term = '') => {
        setIsLoading(true);
        const token = localStorage.getItem('token');

        const safeTerm = encodeURIComponent(term);
        let url = `http://localhost:8080/api/adrese/lista-paginata?page=${page}&size=10`;
        if (term) url = `http://localhost:8080/api/adrese/cauta?termen=${safeTerm}`;

        return axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => {
                if(term) {
                    // I reset pagination when searching because the result set is filtered.
                    setAdrese(res.data);
                    setTotalPages(1);
                } else {
                    setAdrese(res.data.content);
                    setTotalPages(res.data.totalPages);
                }
                setCurrentPage(page);
                return res.data;
            })
            .catch(err => console.error("Error loading addresses:", err))
            .finally(() => {
                setTimeout(() => setIsLoading(false), 200);
            });
    };

    // --- BOOMERANG LOGIC (Return from Incidents) ---
    // I implemented this logic to handle returning users from a detail view back to the exact state they left.
    useEffect(() => {
        const rawData = sessionStorage.getItem('boomerang_pending');
        if (rawData) {
            const data = JSON.parse(rawData);
            // I verify if the return route matches this component.
            if (data.returnRoute === '/adrese' && data.triggerId) {
                if (data.triggerAction === 'reOpenDelete') {
                    // I re-open the delete dialog automatically if the user came back to finish a deletion.
                    setTimeout(() => {
                        handleRequestDelete(data.triggerId);
                    }, 300);
                }
                // I highlight the row to give visual context.
                if (setHighlightId) {
                    setHighlightId(data.triggerId);
                }
                sessionStorage.removeItem('boomerang_pending');
            }
        }
    }, []);

    // I reload data whenever the refresh trigger changes (e.g., after an edit).
    useEffect(() => {
        loadAdrese(currentPage, searchTerm).then((responseData) => {
            if (highlightId) {
                const currentList = responseData.content || responseData;
                if (currentList && Array.isArray(currentList)) {
                    // I check if the highlighted item is on the current page. If not, I find its page.
                    const existsOnPage = currentList.some(a => a.idAdresa === highlightId);
                    if (!existsOnPage) {
                        findPageForId(highlightId);
                    }
                }
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshTrigger]);

    // I calculate the page number for a specific item ID to ensure it's visible after an update.
    const findPageForId = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:8080/api/adrese`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const allData = res.data;
            // I replicate the backend sorting logic to find the correct index.
            allData.sort((a, b) => {
                const locComparison = a.localitate.localeCompare(b.localitate);
                if (locComparison !== 0) return locComparison;
                const judComparison = a.judetSauSector.localeCompare(b.judetSauSector);
                if (judComparison !== 0) return judComparison;
                return a.strada.localeCompare(b.strada);
            });
            const index = allData.findIndex(a => a.idAdresa === id);

            if (index !== -1) {
                const targetPage = Math.floor(index / 10);
                loadAdrese(targetPage, searchTerm);
            }
        } catch (err) {
            console.error("Could not calculate auto-page:", err);
        }
    };

    // I scroll the highlighted row into view smoothly.
    useEffect(() => {
        if (!isLoading && highlightId && rowRefs.current[highlightId]) {
            rowRefs.current[highlightId].scrollIntoView({ behavior: 'smooth', block: 'center' });
            const timer = setTimeout(() => {
                if (onHighlightComplete) onHighlightComplete();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isLoading, adrese, highlightId]);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        loadAdrese(0, val);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        loadAdrese(0, '');
    };

    // I initiate the "Smart Delete" check to see if the address can be safely deleted.
    const handleRequestDelete = (id) => {
        const token = localStorage.getItem('token');
        axios.get(`http://localhost:8080/api/adrese/verifica-stergere/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                setDeleteData(res.data);
                setDeleteId(id);
                setIsDeleteModalOpen(true);
            })
            .catch(err => {
                toast.error("Eroare la verificarea adresei.");
            });
    };

    const handleConfirmDelete = () => {
        const token = localStorage.getItem('token');
        axios.delete(`http://localhost:8080/api/adrese/${deleteId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then((res) => {
                loadAdrese(currentPage, searchTerm);
                setIsDeleteModalOpen(false);
                setDeleteId(null);
                setDeleteData(null);
                toast.success("Adresă ștearsă!");
            })
            .catch(err => toast.error("Eroare la ștergerea adresei!"));
    };

    return (
        <div className="page-container">
            <h2 className="page-title">Registru Adrese</h2>

            <div className="controls-container">
                <div className="search-wrapper">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Căutați după județ/sector, localitate sau stradă..."
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
                        onPageChange={loadAdrese}
                    />
                )}

                <button className="add-btn-primary" onClick={onAddClick}><span>+</span> Adăugați Adresă</button>
            </div>

            <div className="table-responsive">
                <table className="styled-table">
                    <thead>
                    <tr>
                        <th>Județ / Sector</th>
                        <th>Localitate</th>
                        <th>Stradă</th>
                        <th>Nr.</th>
                        <th>Bloc</th>
                        <th>Ap.</th>
                        <th style={{textAlign:'center'}}>Acțiuni</th>
                    </tr>
                    </thead>
                    <tbody>
                    {isLoading ? (
                        <tr><td colSpan="7"><div className="loading-container"><div className="spinner"></div><span>Se încarcă datele...</span></div></td></tr>
                    ) : (
                        adrese && adrese.length > 0 ? (
                            adrese.map((adresa) => (
                                <tr
                                    key={adresa.idAdresa}
                                    ref={(el) => (rowRefs.current[adresa.idAdresa] = el)}
                                    className={highlightId === adresa.idAdresa ? 'flash-row' : ''}
                                >
                                    <td>{adresa.judetSauSector}</td>
                                    <td>{adresa.localitate}</td>
                                    <td>{adresa.strada}</td>
                                    <td>{adresa.numar || ''}</td>
                                    <td>{adresa.bloc || ''}</td>
                                    <td>{adresa.apartament || ''}</td>
                                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                                        <button className="btn-tactical" onClick={() => onEditClick(adresa.idAdresa)} title="Editați">
                                            <i className="fa-solid fa-pen-to-square"></i>
                                        </button>
                                        <button className="btn-tactical-red" onClick={() => handleRequestDelete(adresa.idAdresa)} title="Ștergeți">
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                        <button className="btn-tactical-teal" onClick={() => setViewLocatariId(adresa.idAdresa)} title="Locatari">
                                            <i className="fa-solid fa-users"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="7" style={{textAlign:'center', padding:'20px'}}>Nu există date.</td></tr>
                        )
                    )}
                    </tbody>
                </table>
            </div>

            {/* --- ERROR FIX: I added currentPolitistId and returnRoute props here --- */}
            <DeleteSmartModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                data={deleteData}
                currentPolitistId={deleteId} // I pass the ID to enable the boomerang return logic
                returnRoute="/adrese"        // I specify where to return after resolving blockers
            />

            <Modal isOpen={!!viewLocatariId} onClose={() => setViewLocatariId(null)} title="Locatari la această adresă" maxWidth="850px">
                {viewLocatariId && <ViewLocatariAdresa adresaId={viewLocatariId} onClose={() => setViewLocatariId(null)} />}
            </Modal>
        </div>
    );
};

export default AdreseList;