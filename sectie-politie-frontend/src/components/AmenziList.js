import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Pagination from './Pagination';
import DeleteSmartModal from './DeleteSmartModal';
import './styles/TableStyles.css';
import toast from 'react-hot-toast';

const AmenziList = ({
                        refreshTrigger, onAddClick, onEditClick,
                        highlightId, onHighlightComplete
                    }) => {
    const [amenzi, setAmenzi] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    const rowRefs = useRef({});

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteData, setDeleteData] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const loadAmenzi = (page, term = '') => {
        const token = localStorage.getItem('token');
        let url = `http://localhost:8080/api/amenzi/lista-paginata?page=${page}&size=10`;
        if (term) url = `http://localhost:8080/api/amenzi/cauta?termen=${term}`;

        return axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => {
                if(term) {
                    setAmenzi(res.data);
                    setTotalPages(1);
                } else {
                    setAmenzi(res.data.content);
                    setTotalPages(res.data.totalPages);
                }
                setCurrentPage(page);
                return res.data;
            })
            .catch(err => console.error("Eroare incarcare amenzi:", err));
    };

    useEffect(() => {
        loadAmenzi(currentPage, searchTerm).then((responseData) => {
            if (highlightId) {
                const currentList = responseData.content || responseData;
                const existsOnPage = currentList.some(a => a.idAmenda === highlightId);

                if (!existsOnPage) {
                    findPageForId(highlightId);
                }
            }
        });
    }, [refreshTrigger]);

    const findPageForId = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:8080/api/amenzi`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const allData = res.data;

            allData.sort((a, b) => new Date(b.dataEmitere) - new Date(a.dataEmitere));

            const index = allData.findIndex(a => a.idAmenda === id);

            if (index !== -1) {
                const targetPage = Math.floor(index / 10);
                if (targetPage !== currentPage) {
                    loadAmenzi(targetPage, searchTerm);
                } else {
                    loadAmenzi(currentPage, searchTerm);
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
    }, [amenzi, highlightId]);

    const handlePageChange = (newPage) => loadAmenzi(newPage, searchTerm);

    // --- MODIFICARE 1: Search ---
    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        loadAmenzi(0, val);
    };

    // --- MODIFICARE 2: Clear ---
    const handleClearSearch = () => {
        setSearchTerm('');
        loadAmenzi(0, '');
    };

    const handleRequestDelete = (id) => {
        const token = localStorage.getItem('token');
        axios.get(`http://localhost:8080/api/amenzi/verifica-stergere/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                setDeleteData(res.data);
                setDeleteId(id);
                setIsDeleteModalOpen(true);
            })
            .catch(err => {
                console.error(err);
                toast.error("Eroare la verificarea amenzii.");
            });
    };

    const handleConfirmDelete = () => {
        const token = localStorage.getItem('token');
        axios.delete(`http://localhost:8080/api/amenzi/${deleteId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then((res) => {
                loadAmenzi(currentPage, searchTerm);
                setIsDeleteModalOpen(false);
                setDeleteData(null);
                setDeleteId(null);
                toast.success("Amendă ștearsă!");
            })
            .catch(err => toast.error("Eroare la ștergere!"));
    };

    const formatDataFrumos = (isoString) => {
        if (!isoString) return '-';
        const d = new Date(isoString);
        const zi = String(d.getDate()).padStart(2, '0');
        const luna = String(d.getMonth() + 1).padStart(2, '0');
        const an = d.getFullYear();
        const ora = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        return `${zi}/${luna}/${an} ${ora}:${min}`;
    };

    return (
        <div className="page-container">
            <h2 className="page-title">Registru Amenzi</h2>
            <div className="controls-container">
                {/* --- MODIFICARE 3: Wrapper --- */}
                <div className="search-wrapper">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Căutați..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    {searchTerm && (
                        <button className="search-clear-btn" onClick={handleClearSearch}>&times;</button>
                    )}
                </div>
                {/* ----------------------------- */}

                <button className="add-btn-primary" onClick={onAddClick}><span>+</span> Adăugați Amendă</button>
            </div>

            <table className="styled-table">
                <thead>
                <tr>
                    <th>Motiv</th>
                    <th>Suma (RON)</th>
                    <th>Stare</th>
                    <th>Data & Ora</th>
                    <th>Persoana</th>
                    <th>Agent</th>
                    <th style={{textAlign:'center'}}>Acțiuni</th>
                </tr>
                </thead>
                <tbody>
                {amenzi && amenzi.length > 0 ? (
                    amenzi.map((amenda) => (
                        <tr
                            key={amenda.idAmenda}
                            ref={(el) => (rowRefs.current[amenda.idAmenda] = el)}
                            className={highlightId === amenda.idAmenda ? 'flash-row' : ''}
                        >
                            <td>{amenda.motiv}</td>
                            <td style={{fontWeight: 'bold'}}>{amenda.suma}</td>
                            <td>
                                <span style={{
                                    color: amenda.starePlata === 'Platita' ? 'green' : amenda.starePlata === 'Anulata' ? 'orange' : 'red',
                                    fontWeight: 'bold'
                                }}>
                                    {amenda.starePlata}
                                </span>
                            </td>
                            <td>{formatDataFrumos(amenda.dataEmitere)}</td>
                            <td>{amenda.persoana ? `${amenda.persoana.nume} ${amenda.persoana.prenume}` : 'Nespecificat'}</td>
                            <td>{amenda.politist ? `${amenda.politist.nume} ${amenda.politist.prenume}` : 'Nespecificat'}</td>
                            <td>
                                <div className="action-buttons-container" style={{justifyContent:'center'}}>
                                    <button className="action-btn edit-btn" onClick={() => onEditClick(amenda.idAmenda)}>Editați</button>
                                    <button className="action-btn delete-btn" onClick={() => handleRequestDelete(amenda.idAmenda)}>Ștergeți</button>
                                </div>
                            </td>
                        </tr>
                    ))) : (<tr><td colSpan="7" style={{textAlign:'center', padding:'20px'}}>Nu există date.</td></tr>)}
                </tbody>
            </table>
            {!searchTerm && totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
            <DeleteSmartModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} data={deleteData} />
        </div>
    );
};

export default AmenziList;