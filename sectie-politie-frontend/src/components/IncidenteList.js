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

    // --- LOADING STATE ---
    const [isLoading, setIsLoading] = useState(true);

    const rowRefs = useRef({});

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteData, setDeleteData] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const loadIncidente = (page, term = '') => {
        setIsLoading(true); // Start loading

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
            .catch(err => console.error(err))
            .finally(() => {
                // Stop loading cu delay mic pentru fluiditate
                setTimeout(() => setIsLoading(false), 200);
            });
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
        if (!isLoading && highlightId && rowRefs.current[highlightId]) {
            rowRefs.current[highlightId].scrollIntoView({ behavior: 'smooth', block: 'center' });

            const timer = setTimeout(() => {
                if (onHighlightComplete) onHighlightComplete();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isLoading, incidente, highlightId]);

    const handlePageChange = (newPage) => loadIncidente(newPage, searchTerm);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        loadIncidente(0, val);
    };

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

    // --- MODIFICARE AICI: Stiluri noi pentru status ---
    const getStatusStyle = (status) => {
        const baseStyle = { padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' };
        switch(status) {
            case 'Activ':
                // Verde deschis fundal, verde închis text (stil similar cu 'Martor'/'Victima')
                return { ...baseStyle, backgroundColor: '#e8f5e9', color: '#28a745' };
            case 'Închis':
                // Gri deschis fundal, gri închis text
                return { ...baseStyle, backgroundColor: '#f8f9fa', color: '#6c757d', border: '1px solid #dee2e6' };
            case 'Arhivat':
                // Portocaliu deschis fundal, portocaliu închis text
                return { ...baseStyle, backgroundColor: '#fff3cd', color: '#fd7e14' };
            default:
                return baseStyle;
        }
    };

    return (
        <div className="page-container">
            <h2 className="page-title">Registru Incidente</h2>
            <div className="controls-container">
                <div className="search-wrapper">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Căutați după tipul incidentului sau polițist..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    {searchTerm && (
                        <button className="search-clear-btn" onClick={handleClearSearch}>&times;</button>
                    )}
                </div>

                <button className="add-btn-primary" onClick={onAddClick}><span>+</span> Adăugați Incident</button>
            </div>

            <div className="table-responsive">
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

                    {/* LOGICA LOADING */}
                    {isLoading ? (
                        <tr>
                            <td colSpan="7">
                                <div className="loading-container">
                                    <div className="spinner"></div>
                                    <span>Se încarcă datele...</span>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        incidente && incidente.length > 0 ? (
                            incidente.map((inc) => (
                                <tr
                                    key={inc.idIncident}
                                    ref={(el) => (rowRefs.current[inc.idIncident] = el)}
                                    className={highlightId === inc.idIncident ? 'flash-row' : ''}
                                >
                                    <td>{inc.tipIncident}</td>
                                    {/* AICI SE APLICĂ NOUL STIL */}
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
                            ))
                        ) : (
                            <tr><td colSpan="7" style={{textAlign:'center', padding:'20px'}}>Nu există date.</td></tr>
                        )
                    )}
                    </tbody>
                </table>
            </div>
            {!searchTerm && !isLoading && totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
            <DeleteSmartModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} data={deleteData} />
        </div>
    );
};

export default IncidenteList;