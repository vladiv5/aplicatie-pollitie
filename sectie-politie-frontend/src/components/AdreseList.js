/** Componenta principala pentru afisarea si gestionarea tabelului de adrese
 * Include paginare, cautare si actiuni (editare, stergere, vizualizare locatari)
 * @author Ivan Vlad-Daniel
 * @version 11 ianuarie 2026
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
                        onHighlightComplete
                    }) => {
    const [adrese, setAdrese] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const rowRefs = useRef({});

    // --- State pentru modalul de stergere inteligenta ---
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteData, setDeleteData] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    // --- State pentru modalul de vizualizare locatari ---
    const [viewLocatariId, setViewLocatariId] = useState(null);

    // Incarcarea datelor de la server (cu paginare si cautare)
    const loadAdrese = (page, term = '') => {
        setIsLoading(true);
        const token = localStorage.getItem('token');

        // Codific termenul pentru a evita erori cu caractere speciale
        const safeTerm = encodeURIComponent(term);
        let url = `http://localhost:8080/api/adrese/lista-paginata?page=${page}&size=10`;
        if (term) url = `http://localhost:8080/api/adrese/cauta?termen=${safeTerm}`;

        return axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => {
                if(term) {
                    setAdrese(res.data);
                    setTotalPages(1);
                } else {
                    setAdrese(res.data.content);
                    setTotalPages(res.data.totalPages);
                }
                setCurrentPage(page);
                return res.data;
            })
            .catch(err => console.error("Eroare incarcare adrese:", err))
            .finally(() => {
                setTimeout(() => setIsLoading(false), 200);
            });
    };

    useEffect(() => {
        loadAdrese(currentPage, searchTerm).then((responseData) => {
            if (highlightId) {
                // Logica pentru a sari automat la pagina elementului proaspat adaugat/editat
                const currentList = responseData.content || responseData;
                if (currentList && Array.isArray(currentList)) {
                    const existsOnPage = currentList.some(a => a.idAdresa === highlightId);
                    if (!existsOnPage) {
                        findPageForId(highlightId);
                    }
                }
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshTrigger]);

    // Algoritm pentru gasirea paginii corecte a unui element (pentru highlight)
    const findPageForId = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:8080/api/adrese`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const allData = res.data;
            // Sortare identica cu backend-ul pentru consistenta
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
            console.error("Nu am putut calcula pagina automata:", err);
        }
    };

    // Scroll automat la randul evidentiat
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

    // Verific daca adresa poate fi stearsa
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

            <DeleteSmartModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} data={deleteData} />

            <Modal isOpen={!!viewLocatariId} onClose={() => setViewLocatariId(null)} title="Locatari la această adresă" maxWidth="850px">
                {viewLocatariId && <ViewLocatariAdresa adresaId={viewLocatariId} onClose={() => setViewLocatariId(null)} />}
            </Modal>
        </div>
    );
};

export default AdreseList;