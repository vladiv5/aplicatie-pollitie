import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Pagination from './Pagination';
import DeleteSmartModal from './DeleteSmartModal';
import './styles/TableStyles.css';
import toast from 'react-hot-toast';

const IncidenteList = ({
                           refreshTrigger, onAddClick, onEditClick, onViewClick, onManageParticipantsClick,
                           highlightId, onHighlightComplete
                       }) => {
    const [incidente, setIncidente] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    const rowRefs = useRef({});

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteData, setDeleteData] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const loadIncidente = (page, term = '') => {
        const token = localStorage.getItem('token');
        let url = `http://localhost:8080/api/incidente/lista-paginata?page=${page}&size=10`;
        if (term) url = `http://localhost:8080/api/incidente/cauta?termen=${term}`;

        return axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => {
                if(term) {
                    setIncidente(res.data);
                    setTotalPages(1);
                } else {
                    setIncidente(res.data.content);
                    setTotalPages(res.data.totalPages);
                }
                setCurrentPage(page);
                return res.data;
            })
            .catch(err => console.error(err));
    };

    useEffect(() => {
        loadIncidente(currentPage, searchTerm).then((responseData) => {
            if (highlightId) {
                const currentList = responseData.content || responseData;
                const existsOnPage = currentList.some(inc => inc.idIncident === highlightId);

                if (!existsOnPage) {
                    findPageForId(highlightId);
                }
            }
        });
    }, [refreshTrigger]);

    const findPageForId = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:8080/api/incidente`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const allData = res.data;

            allData.sort((a, b) => new Date(b.dataEmitere) - new Date(a.dataEmitere));

            const index = allData.findIndex(inc => inc.idIncident === id);

            if (index !== -1) {
                const targetPage = Math.floor(index / 10);
                if (targetPage !== currentPage) {
                    loadIncidente(targetPage, searchTerm);
                } else {
                    loadIncidente(currentPage, searchTerm);
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
    }, [incidente, highlightId]);

    const handlePageChange = (newPage) => loadIncidente(newPage, searchTerm);

    // --- MODIFICARE 1: Search ---
    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        loadIncidente(0, val);
    };

    // --- MODIFICARE 2: Clear ---
    const handleClearSearch = () => {
        setSearchTerm('');
        loadIncidente(0, '');
    };

    const handleRequestDelete = (id) => {
        const token = localStorage.getItem('token');
        axios.get(`http://localhost:8080/api/incidente/verifica-stergere/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                setDeleteData(res.data);
                setDeleteId(id);
                setIsDeleteModalOpen(true);
            })
            .catch(err => {
                toast.error("Eroare la verificarea incidentului.");
            });
    };

    const handleConfirmDelete = () => {
        const token = localStorage.getItem('token');
        axios.delete(`http://localhost:8080/api/incidente/${deleteId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then((res) => {
                loadIncidente(currentPage, searchTerm);
                setIsDeleteModalOpen(false);
                setDeleteData(null);
                setDeleteId(null);
                toast.success("Incidentul a fost șters!");
            })
            .catch(err => toast.error("Eroare la ștergere!"));
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'Activ': return { backgroundColor: '#28a745', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' };
            case 'Închis': return { backgroundColor: '#6c757d', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' };
            case 'Arhivat': return { backgroundColor: '#fd7e14', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' };
            default: return {};
        }
    };

    return (
        <div className="page-container">
            <h2 className="page-title">Registru Incidente</h2>
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

                <button className="add-btn-primary" onClick={onAddClick}><span>+</span> Adăugați Incident</button>
            </div>

            <table className="styled-table">
                <thead>
                <tr>
                    <th>Tip</th>
                    <th>Stare</th>
                    <th>Data & Ora</th>
                    <th>Locație</th>
                    <th>Adresă</th>
                    <th>Polițist</th>
                    <th style={{textAlign:'center'}}>Acțiuni</th>
                </tr>
                </thead>
                <tbody>
                {incidente && incidente.length > 0 ? (
                    incidente.map((inc) => (
                        <tr
                            key={inc.idIncident}
                            ref={(el) => (rowRefs.current[inc.idIncident] = el)}
                            className={highlightId === inc.idIncident ? 'flash-row' : ''}
                        >
                            <td>{inc.tipIncident}</td>
                            <td><span style={getStatusStyle(inc.status)}>{inc.status || 'Activ'}</span></td>
                            <td>{inc.dataEmitere ? new Date(inc.dataEmitere).toLocaleString('ro-RO').substring(0, 17) : ''}</td>
                            <td>{inc.descriereLocatie}</td>
                            <td>{inc.adresaIncident ? `${inc.adresaIncident.strada} ${inc.adresaIncident.numar}` : ''}</td>
                            <td>{inc.politistResponsabil ? `${inc.politistResponsabil.nume} ${inc.politistResponsabil.prenume}` : ''}</td>
                            <td>
                                <div className="action-buttons-container" style={{justifyContent:'center'}}>
                                    <button className="action-btn" style={{ backgroundColor: '#17a2b8', color: 'white' }} onClick={() => onViewClick(inc)}>Vizualizați</button>
                                    <button className="action-btn edit-btn" onClick={() => onEditClick(inc.idIncident)}>Editați</button>
                                    <button className="action-btn delete-btn" onClick={() => handleRequestDelete(inc.idIncident)}>Ștergeți</button>
                                    <button className="action-btn" style={{ backgroundColor: '#6f42c1', color: 'white', marginLeft: '5px' }} onClick={() => onManageParticipantsClick(inc.idIncident)}><i className="fa fa-users"></i> Pers</button>
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

export default IncidenteList;