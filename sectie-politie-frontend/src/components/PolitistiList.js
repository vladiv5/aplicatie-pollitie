import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Pagination from './Pagination';
import DeleteSmartModal from './DeleteSmartModal';
import './styles/TableStyles.css';
import toast from 'react-hot-toast';

const PolitistiList = ({
                           refreshTrigger,
                           onAddClick,
                           onEditClick,
                           highlightId,
                           onHighlightComplete,
                           setHighlightId // <--- Primim setter-ul
                       }) => {
    // --- STATE ---
    const [politisti, setPolitisti] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('nume');

    // Referințe pentru rânduri (pentru scroll)
    const rowRefs = useRef({});

    // --- DELETE STATE ---
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteData, setDeleteData] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();

    // --- LOAD DATA ---
    // Modificat putin pentru a accepta parametri expliciti (page, term)
    // Daca nu sunt dati, foloseste state-ul curent (currentPage, searchTerm)
    const loadPolitisti = (pageArg, termArg) => {
        const token = localStorage.getItem('token');

        // Folosim argumentele daca exista, altfel folosim state-ul
        // Atentie: pageArg poate fi 0, deci verificam undefined
        const page = (pageArg !== undefined) ? pageArg : currentPage;
        const term = (termArg !== undefined) ? termArg : searchTerm;

        let url = `http://localhost:8080/api/politisti/lista-paginata?page=${page}&size=10&sortBy=${sortBy}&dir=asc`;

        // Daca avem termen de cautare, schimbam endpointul
        if (term) {
            url = `http://localhost:8080/api/politisti/cauta?termen=${term}`;
        }

        // Returnăm Promise pentru chaining
        return axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => {
                if(term) {
                    // La cautare, backendul returneaza lista simpla (fara paginare spring data)
                    setPolitisti(res.data);
                    setTotalPages(1);
                } else {
                    // La lista paginata, backendul returneaza Page<Politist>
                    setPolitisti(res.data.content);
                    setTotalPages(res.data.totalPages);
                }
                setCurrentPage(page);
                return res.data;
            })
            .catch(err => console.error("Eroare incarcare:", err));
    };

    // =========================================================
    // LOGICA BUMERANG V2 (SESSION STORAGE - Rezistent la Back)
    // =========================================================
    useEffect(() => {
        // 1. Verificăm Session Storage la montare
        const rawData = sessionStorage.getItem('boomerang_pending');

        if (rawData) {
            const data = JSON.parse(rawData);

            // Verificăm dacă bumerangul este destinat acestei pagini
            if (data.returnRoute === '/politisti' && data.triggerId) {

                // A. Redeschidem modalul de verificare (ca să vedem dacă s-a rezolvat problema)
                if (data.triggerAction === 'reOpenDelete') {
                    // Punem un mic delay ca să se randeze pagina întâi
                    setTimeout(() => {
                        handleRequestDelete(data.triggerId);
                    }, 300);
                }

                // B. Activăm Highlight-ul pe rând (Vizual)
                if (setHighlightId) {
                    setHighlightId(data.triggerId);
                }

                // C. Curățăm storage-ul ca să nu se repete la infinit
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
                // Verificam siguranta (currentList poate fi null la eroare)
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
        if (highlightId && rowRefs.current[highlightId]) {
            rowRefs.current[highlightId].scrollIntoView({ behavior: 'smooth', block: 'center' });

            const timer = setTimeout(() => {
                if (onHighlightComplete) onHighlightComplete();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [politisti, highlightId]);

    // --- HANDLERS STANDARD ---
    const handlePageChange = (newPage) => loadPolitisti(newPage, searchTerm);

    // Cand scriem in search, resetam la pagina 0 si trimitem termenul
    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        loadPolitisti(0, val);
    };

    // --- DELETE LOGIC ---
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

    // --- FUNCȚIA NOUĂ DE CLEAR ---
    const handleClearSearch = () => {
        setSearchTerm(''); // Golim state-ul local
        loadPolitisti(0, ''); // Fortăm incarcarea listei complete (pagina 0, termen gol)
    };

    return (
        <div className="page-container">
            <h2 className="page-title">Gestiune Polițiști</h2>
            <div className="controls-container">

                {/* SEARCH WRAPPER CU BUTON X */}
                <div className="search-wrapper">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Căutați după nume..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    {/* Afisam butonul X doar daca avem text */}
                    {searchTerm && (
                        <button className="search-clear-btn" onClick={handleClearSearch}>&times;</button>
                    )}
                </div>

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
                        <th style={{textAlign: 'center'}}>Acțiuni</th>
                    </tr>
                    </thead>
                    <tbody>
                    {politisti && politisti.length > 0 ? (
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
                                <td>
                                    <div className="action-buttons-container" style={{justifyContent: 'center'}}>
                                        <button className="action-btn edit-btn" onClick={() => onEditClick(politist.idPolitist)}>Editați</button>
                                        <button className="action-btn delete-btn" onClick={() => handleRequestDelete(politist.idPolitist)}>Ștergeți</button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="6" style={{textAlign: 'center'}}>Nu au fost găsite înregistrări.</td></tr>
                    )}
                    </tbody>
                </table>
            </div>
            {!searchTerm && totalPages > 1 && (<Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />)}

            <DeleteSmartModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                data={deleteData}
                currentPolitistId={deleteId}
                returnRoute="/politisti" // Spune modalului cine l-a chemat
            />
        </div>
    );
};

export default PolitistiList;