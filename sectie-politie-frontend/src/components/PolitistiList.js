import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Pagination from './Pagination';
import DeleteSmartModal from './DeleteSmartModal';
import './styles/TableStyles.css';
import toast from 'react-hot-toast';

const PolitistiList = ({ refreshTrigger, onAddClick, onEditClick, highlightId, onHighlightComplete }) => {
    // --- STATE ---
    const [politisti, setPolitisti] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('nume'); // Default sort by Nume

    // Referințe pentru rânduri (pentru scroll)
    const rowRefs = useRef({});

    // --- DELETE STATE ---
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteData, setDeleteData] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();

    // --- LOAD DATA ---
    const loadPolitisti = (page, term = '') => {
        const token = localStorage.getItem('token');
        let url = `http://localhost:8080/api/politisti/lista-paginata?page=${page}&size=10&sortBy=${sortBy}&dir=asc`;
        if (term) url = `http://localhost:8080/api/politisti/cauta?termen=${term}`;

        // Returnăm Promise ca să putem înlănțui (chain) logica de focus
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
            .catch(err => console.error("Eroare incarcare:", err));
    };

    // --- REFRESH + AUTO JUMP LOGIC ---
    useEffect(() => {
        // 1. Încărcăm datele curente
        loadPolitisti(currentPage, searchTerm).then(() => {
            // 2. Dacă avem un ID de evidențiat (highlightId)
            if (highlightId) {
                // Verificăm dacă e DEJA pe ecran
                const isOnScreen = rowRefs.current[highlightId];

                if (!isOnScreen) {
                    // Dacă NU e pe ecran, trebuie să aflăm pe ce pagină este
                    findPageForId(highlightId);
                }
                // Dacă e pe ecran, useEffect-ul de mai jos se va ocupa de scroll
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshTrigger]);

    // --- LOGICA DE CĂUTARE A PAGINII ---
    const findPageForId = async (id) => {
        try {
            const token = localStorage.getItem('token');
            // Luăm TOATĂ lista simplă (doar ID-uri ideal, dar aici luăm tot pt simplitate)
            // Dacă ai endpoint de 'toata-lista', e perfect. Dacă nu, e mai greu.
            // Presupunând că ai endpoint-ul de la rapoarte/dropdown-uri:
            const res = await axios.get(`http://localhost:8080/api/politisti/toata-lista`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const allData = res.data;

            // Sortăm client-side EXACT cum sortează serverul (Nume ASC implicit)
            // Atenție: Dacă utilizatorul a schimbat sortarea, trebuie să reflectăm asta aici.
            // Momentan hardcodam sortarea default (Nume)
            allData.sort((a, b) => a.nume.localeCompare(b.nume));

            // Găsim indexul
            const index = allData.findIndex(p => p.idPolitist === id);

            if (index !== -1) {
                // Calculăm pagina (Index / PageSize)
                const targetPage = Math.floor(index / 10);

                // Dacă pagina țintă e diferită de cea curentă, încărcăm acea pagină
                if (targetPage !== currentPage) {
                    loadPolitisti(targetPage, searchTerm);
                    // După ce se încarcă, useEffect-ul de Scroll se va activa
                }
            }
        } catch (err) {
            console.error("Nu am putut calcula pagina automata:", err);
        }
    };

    // --- EFFECT: SCROLL & FLASH ---
    useEffect(() => {
        if (highlightId && rowRefs.current[highlightId]) {
            // 1. Scroll lin la element
            rowRefs.current[highlightId].scrollIntoView({ behavior: 'smooth', block: 'center' });

            // 2. Curățăm ID-ul după 3 secunde (cât ține animația CSS)
            const timer = setTimeout(() => {
                if (onHighlightComplete) onHighlightComplete();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [politisti, highlightId]); // Se activează când lista se randează și conține elementul

    // --- HANDLERS STANDARD ---
    const handlePageChange = (newPage) => loadPolitisti(newPage, searchTerm);
    const handleSearchChange = (e) => { setSearchTerm(e.target.value); loadPolitisti(0, e.target.value); };

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

    // --- RENDER ---
    return (
        <div className="page-container">
            <h2 className="page-title">Gestiune Polițiști</h2>
            <div className="controls-container">
                <input type="text" className="search-input" placeholder="Căutați după nume..." value={searchTerm} onChange={handleSearchChange} />
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
                                // AICI E MAGIA: Legăm referința și clasa CSS condiționată
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

            <DeleteSmartModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} data={deleteData} currentPolitistId={deleteId} />
        </div>
    );
};

export default PolitistiList;