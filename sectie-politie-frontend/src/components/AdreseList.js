import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Pagination from './Pagination';
import DeleteSmartModal from './DeleteSmartModal';
import './styles/TableStyles.css';
import toast from 'react-hot-toast';

const AdreseList = ({
                        refreshTrigger,
                        onAddClick,
                        onEditClick,
                        onViewLocatariClick,
                        highlightId, onHighlightComplete // <--- PROPS
                    }) => {
    const [adrese, setAdrese] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    const rowRefs = useRef({}); // <--- REF

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteData, setDeleteData] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();

    const loadAdrese = (page, term = '') => {
        const token = localStorage.getItem('token');
        let url = `http://localhost:8080/api/adrese/lista-paginata?page=${page}&size=10`;
        if (term) url = `http://localhost:8080/api/adrese/cauta?termen=${term}`;

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
            .catch(err => console.error("Eroare incarcare adrese:", err));
    };

    // --- REFRESH & AUTO JUMP ---
    useEffect(() => {
        loadAdrese(currentPage, searchTerm).then((responseData) => {
            if (highlightId) {
                const currentList = responseData.content || responseData;
                const existsOnPage = currentList.some(a => a.idAdresa === highlightId);

                if (!existsOnPage) {
                    findPageForId(highlightId);
                }
            }
        });
    }, [refreshTrigger]);

    // --- LOGICA FIND PAGE ---
    const findPageForId = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:8080/api/adrese`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const allData = res.data;

            // SORTARE COMPLEXA (La fel ca in Backend)
            // 1. Localitate -> 2. Judet/Sector -> 3. Strada
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
                if (targetPage !== currentPage) {
                    loadAdrese(targetPage, searchTerm);
                } else {
                    loadAdrese(currentPage, searchTerm);
                }
            }
        } catch (err) {
            console.error("Nu am putut calcula pagina automata:", err);
        }
    };

    // --- SCROLL & FLASH ---
    useEffect(() => {
        if (highlightId && rowRefs.current[highlightId]) {
            rowRefs.current[highlightId].scrollIntoView({ behavior: 'smooth', block: 'center' });

            const timer = setTimeout(() => {
                if (onHighlightComplete) onHighlightComplete();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [adrese, highlightId]);

    const handlePageChange = (newPage) => loadAdrese(newPage, searchTerm);
    const handleSearchChange = (e) => { setSearchTerm(e.target.value); loadAdrese(0, e.target.value); };

    // --- DELETE LOGIC ---
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
                <input type="text" className="search-input" placeholder="Căutați..." value={searchTerm} onChange={handleSearchChange} />
                <button className="add-btn-primary" onClick={onAddClick}><span>+</span> Adăugați Adresă</button>
            </div>

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
                {adrese && adrese.length > 0 ? (
                    adrese.map((adresa) => (
                        <tr
                            key={adresa.idAdresa}
                            // REF & CLASS
                            ref={(el) => (rowRefs.current[adresa.idAdresa] = el)}
                            className={highlightId === adresa.idAdresa ? 'flash-row' : ''}
                        >
                            <td>{adresa.judetSauSector}</td>
                            <td>{adresa.localitate}</td>
                            <td>{adresa.strada}</td>
                            <td>{adresa.numar ? adresa.numar : ''}</td>
                            <td>{adresa.bloc ? adresa.bloc : ''}</td>
                            <td>{adresa.apartament ? adresa.apartament : ''}</td>
                            <td>
                                <div className="action-buttons-container" style={{justifyContent:'center'}}>
                                    <button className="action-btn edit-btn" onClick={() => onEditClick(adresa.idAdresa)}>Editați</button>
                                    <button className="action-btn delete-btn" onClick={() => handleRequestDelete(adresa.idAdresa)}>Ștergeți</button>
                                    <button className="action-btn" style={{ backgroundColor: '#fd7e14', color: 'white', marginRight: '5px' }} onClick={() => onViewLocatariClick(adresa.idAdresa)} title="Vizualizați Locatari"><i className="fa fa-users"></i> Locatari</button>
                                </div>
                            </td>
                        </tr>
                    ))) : (<tr><td colSpan="7" style={{textAlign:'center', padding:'20px'}}>Nu există date.</td></tr>)}
                </tbody>
            </table>
            {!searchTerm && totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
            <DeleteSmartModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} data={deleteData} currentPolitistId={deleteId} returnRoute="/adrese" />
        </div>
    );
};

export default AdreseList;