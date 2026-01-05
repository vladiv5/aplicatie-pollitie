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
                          onHighlightComplete
                      }) => {
    // --- STATE INTERN ---
    const [persoane, setPersoane] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy] = useState('nume');

    // Ref pentru randuri
    const rowRefs = useRef({});

    // --- STATE DELETE SMART ---
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteData, setDeleteData] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const location = useLocation();

    // --- FETCH DATA ---
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
                // Returnam datele brute pentru verificare
                return res.data;
            })
            .catch(err => console.error("Eroare incarcare persoane:", err));
    };

    // --- REFRESH & AUTO JUMP ---
    useEffect(() => {
        loadPersoane(currentPage, searchTerm).then((responseData) => {
            if (highlightId) {
                // --- FIX EDITARE ---
                // Verificăm dacă ID-ul există în DATELE primite, nu în DOM (refs)
                // responseData poate fi array simplu (la search) sau obiect { content: [...] } (la paginare)
                const currentList = responseData.content || responseData;

                // Căutăm ID-ul în lista curentă de date
                const existsOnPage = currentList.some(p => p.idPersoana === highlightId);

                // Dacă NU e în datele paginii curente, înseamnă că s-a mutat -> Căutăm pagina
                if (!existsOnPage) {
                    findPageForId(highlightId);
                }
                // Dacă E în date, useEffect-ul de scroll de mai jos își va face treaba
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshTrigger]);

    // --- LOGICA DE CAUTARE PAGINA ---
    const findPageForId = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:8080/api/persoane`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const allData = res.data;

            // Sortam by Nume (default) pentru a găsi indexul corect
            allData.sort((a, b) => a.nume.localeCompare(b.nume));

            const index = allData.findIndex(p => p.idPersoana === id);

            if (index !== -1) {
                const targetPage = Math.floor(index / 10);
                // Încărcăm pagina nouă doar dacă e diferită
                if (targetPage !== currentPage) {
                    loadPersoane(targetPage, searchTerm);
                } else {
                    // Dacă prin absurd e aceeași pagină (dar nu apăruse în datele vechi), reîncărcăm
                    loadPersoane(currentPage, searchTerm);
                }
            }
        } catch (err) {
            console.error("Nu am putut calcula pagina automata:", err);
        }
    };

    // --- SCROLL & FLASH ---
    useEffect(() => {
        // Acest effect rulează CÂND se actualizează lista 'persoane'
        if (highlightId && rowRefs.current[highlightId]) {
            // Dacă elementul a apărut în DOM, facem scroll la el
            rowRefs.current[highlightId].scrollIntoView({ behavior: 'smooth', block: 'center' });

            const timer = setTimeout(() => {
                if (onHighlightComplete) onHighlightComplete();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [persoane, highlightId]); // Dependența 'persoane' e cheia

    // --- Handlere Standard ---
    const handlePageChange = (newPage) => loadPersoane(newPage, searchTerm);
    const handleSearchChange = (e) => { setSearchTerm(e.target.value); loadPersoane(0, e.target.value); };

    // --- Delete Logic ---
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
                console.error(err);
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
        const zi = String(date.getDate()).padStart(2, '0');
        const luna = String(date.getMonth() + 1).padStart(2, '0');
        const an = date.getFullYear();
        return `${zi}.${luna}.${an}`;
    };

    return (
        <div className="page-container">
            <h2 className="page-title">Registru Persoane</h2>

            <div className="controls-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Căutați după nume, prenume sau CNP..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
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
                            // AICI LEGĂM REF-UL PENTRU SCROLL
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
                returnRoute="/persoane"
            />
        </div>
    );
};

export default PersoaneList;