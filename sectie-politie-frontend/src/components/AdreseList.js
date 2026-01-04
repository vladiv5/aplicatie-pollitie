import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Pagination from './Pagination';
import DeleteSmartModal from './DeleteSmartModal';
import './styles/TableStyles.css';
import toast from 'react-hot-toast'; // <--- IMPORT

const AdreseList = ({
                        refreshTrigger,
                        onAddClick,
                        onEditClick,
                        onViewLocatariClick
                    }) => {
    const [adrese, setAdrese] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteData, setDeleteData] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();

    const loadAdrese = (page, term = '') => {
        const token = localStorage.getItem('token');
        let url = `http://localhost:8080/api/adrese/lista-paginata?page=${page}&size=10`;
        if (term) url = `http://localhost:8080/api/adrese/cauta?termen=${term}`;

        axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => {
                if(term) {
                    setAdrese(res.data);
                    setTotalPages(1);
                } else {
                    setAdrese(res.data.content);
                    setTotalPages(res.data.totalPages);
                }
                setCurrentPage(page);
            })
            .catch(err => console.error("Eroare incarcare adrese:", err));
    };

    useEffect(() => {
        loadAdrese(currentPage, searchTerm);
    }, [refreshTrigger]);

    useEffect(() => {
        if (location.state && location.state.triggerAction === 'reOpenDelete') {
            const idToReCheck = location.state.triggerId;
            window.history.replaceState({}, document.title);
            if(idToReCheck) {
                setTimeout(() => {
                    handleRequestDelete(idToReCheck);
                }, 100);
            }
        }
    }, [location]);

    const handlePageChange = (newPage) => loadAdrese(newPage, searchTerm);
    const handleSearchChange = (e) => { setSearchTerm(e.target.value); loadAdrese(0, e.target.value); };

    // --- LOGICA DELETE SMART ---
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
                console.error(err);
                toast.error("Eroare la verificarea adresei."); // <--- TOAST
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
                toast.success("Adresă ștearsă!"); // <--- TOAST
            })
            .catch(err => toast.error("Eroare la ștergerea adresei!")); // <--- TOAST
    };

    return (
        <div className="page-container">
            <h2 className="page-title">Registru Adrese</h2>
            <div className="controls-container">
                <input type="text" className="search-input" placeholder="Caută..." value={searchTerm} onChange={handleSearchChange} />
                <button className="add-btn-primary" onClick={onAddClick}><span>+</span> Adaugă Adresă</button>
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
                        <tr key={adresa.idAdresa}>
                            <td>{adresa.judetSauSector}</td>
                            <td>{adresa.localitate}</td>
                            <td>{adresa.strada}</td>
                            <td>{adresa.numar ? adresa.numar : ''}</td>
                            <td>{adresa.bloc ? adresa.bloc : ''}</td>
                            <td>{adresa.apartament ? adresa.apartament : ''}</td>
                            <td>
                                <div className="action-buttons-container" style={{justifyContent:'center'}}>
                                    <button className="action-btn edit-btn" onClick={() => onEditClick(adresa.idAdresa)}>Edit</button>
                                    <button className="action-btn delete-btn" onClick={() => handleRequestDelete(adresa.idAdresa)}>Șterge</button>
                                    <button className="action-btn" style={{ backgroundColor: '#fd7e14', color: 'white', marginRight: '5px' }} onClick={() => onViewLocatariClick(adresa.idAdresa)} title="Vezi Locatari"><i className="fa fa-users"></i> Locatari</button>
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