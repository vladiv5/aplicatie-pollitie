import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom'; // <--- IMPORTURI OBLIGATORII
import Pagination from './Pagination';
import DeleteSmartModal from './DeleteSmartModal';
import './styles/TableStyles.css';
import toast from 'react-hot-toast';

const PolitistiList = ({ refreshTrigger, onAddClick, onEditClick }) => {
    // --- STATE DATE TABEL ---
    const [politisti, setPolitisti] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('nume');

    // --- STATE DELETE SMART ---
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteData, setDeleteData] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    // --- NAVIGARE ---
    const location = useLocation();
    const navigate = useNavigate();

    // --- FETCH DATA ---
    const loadPolitisti = (page, term = '') => {
        const token = localStorage.getItem('token');
        let url = `http://localhost:8080/api/politisti/lista-paginata?page=${page}&size=10&sortBy=${sortBy}&dir=asc`;

        if (term) url = `http://localhost:8080/api/politisti/cauta?termen=${term}`;

        axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => {
                if(term) {
                    setPolitisti(res.data);
                    setTotalPages(1);
                } else {
                    setPolitisti(res.data.content);
                    setTotalPages(res.data.totalPages);
                }
                setCurrentPage(page);
            })
            .catch(err => console.error("Eroare incarcare:", err));
    };

    useEffect(() => {
        loadPolitisti(currentPage, searchTerm);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshTrigger]);

    // =========================================================
    // LOGICA BUMERANG (Intoarcere de la Incidente/Amenzi)
    // =========================================================
    useEffect(() => {
        // Verificam daca ne-am intors cu ordinul "reOpenDelete"
        if (location.state && location.state.triggerAction === 'reOpenDelete') {
            const idToReCheck = location.state.triggerId;

            // 1. Curatam state-ul browserului (ca sa nu intre in bucla la Refresh)
            window.history.replaceState({}, document.title);

            // 2. Redeschidem verificarea pentru acel politist
            if(idToReCheck) {
                // Mic delay ca sa se incarce UI-ul
                setTimeout(() => {
                    handleRequestDelete(idToReCheck);
                }, 100);
            }
        }
    }, [location]);
    // =========================================================

    const handlePageChange = (newPage) => loadPolitisti(newPage, searchTerm);
    const handleSearchChange = (e) => { setSearchTerm(e.target.value); loadPolitisti(0, e.target.value); };

    // --- LOGICA DELETE SMART ---
    const handleRequestDelete = (id) => {
        const token = localStorage.getItem('token');
        axios.get(`http://localhost:8080/api/politisti/verifica-stergere/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                setDeleteData(res.data);
                setDeleteId(id);
                setIsDeleteModalOpen(true);
            })
            .catch(err => {
                console.error(err);
                toast.error("Eroare la verificarea polițistului.");
            });
    };

    const handleConfirmDelete = () => {
        const token = localStorage.getItem('token');
        axios.delete(`http://localhost:8080/api/politisti/${deleteId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then((res) => {
                loadPolitisti(currentPage, searchTerm);
                setIsDeleteModalOpen(false);
                setDeleteId(null);
                setDeleteData(null);
                toast.success("Polițist șters cu succes!");
            })
            .catch(err => {
                toast.error("Eroare la ștergerea efectivă!");
            });
    };

    return (
        <div className="page-container">
            <h2 className="page-title">Gestiune Polițiști</h2>
            <div className="controls-container">
                <input type="text" className="search-input" placeholder="Caută după nume..." value={searchTerm} onChange={handleSearchChange} />
                <button className="add-btn-primary" onClick={onAddClick}><span>+</span> Adaugă Polițist</button>
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
                            <tr key={politist.idPolitist}>
                                <td>{politist.nume}</td>
                                <td>{politist.prenume}</td>
                                <td>{politist.grad}</td>
                                <td>{politist.functie}</td>
                                <td>{politist.telefon_serviciu}</td>
                                <td>
                                    <div className="action-buttons-container" style={{justifyContent: 'center'}}>
                                        <button className="action-btn edit-btn" onClick={() => onEditClick(politist.idPolitist)}>Edit</button>
                                        <button className="action-btn delete-btn" onClick={() => handleRequestDelete(politist.idPolitist)}>Șterge</button>
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
                currentPolitistId={deleteId} // <--- TRIMIT ID-UL PENTRU RETUR
            />
        </div>
    );
};

export default PolitistiList;