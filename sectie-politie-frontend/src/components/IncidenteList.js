import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Pagination from './Pagination';
import DeleteSmartModal from './DeleteSmartModal'; // Importam modalul
import './styles/TableStyles.css';

const IncidenteList = ({
                           refreshTrigger, onAddClick, onEditClick, onViewClick, onManageParticipantsClick
                       }) => {
    // --- STATE DATE ---
    const [incidente, setIncidente] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    // --- STATE DELETE SMART ---
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteData, setDeleteData] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    // --- FETCH ---
    const loadIncidente = (page, term = '') => {
        const token = localStorage.getItem('token');
        let url = `http://localhost:8080/api/incidente/lista-paginata?page=${page}&size=10`;
        if (term) url = `http://localhost:8080/api/incidente/cauta?termen=${term}`;

        axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => {
                if(term) {
                    setIncidente(res.data);
                    setTotalPages(1);
                } else {
                    setIncidente(res.data.content);
                    setTotalPages(res.data.totalPages);
                }
                setCurrentPage(page);
            })
            .catch(err => console.error(err));
    };

    useEffect(() => { loadIncidente(currentPage, searchTerm); }, [refreshTrigger]);

    const handlePageChange = (newPage) => loadIncidente(newPage, searchTerm);
    const handleSearchChange = (e) => { setSearchTerm(e.target.value); loadIncidente(0, e.target.value); };

    // --- LOGICA DELETE SMART ---

    // 1. Verificare
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
                console.error(err);
                alert("Eroare la verificarea incidentului.");
            });
    };

    // 2. Confirmare
    const handleConfirmDelete = () => {
        const token = localStorage.getItem('token');

        axios.delete(`http://localhost:8080/api/incidente/${deleteId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then((res) => {
                // Facem refresh la tabel
                loadIncidente(currentPage, searchTerm);

                // Inchidem modalul
                setIsDeleteModalOpen(false);
                setDeleteData(null);
                setDeleteId(null);

                // --- AFISAM CONFIRMAREA ---
                alert(res.data); // "Incidentul a fost șters cu succes!"
            })
            .catch(err => alert("Eroare la ștergere!"));
    };

    // Funcție pentru culoarea statusului
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
                <input type="text" className="search-input" placeholder="Caută..." value={searchTerm} onChange={handleSearchChange} />
                <button className="add-btn-primary" onClick={onAddClick}><span>+</span> Adaugă Incident</button>
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
                        <tr key={inc.idIncident}>
                            <td>{inc.tipIncident}</td>
                            <td><span style={getStatusStyle(inc.status)}>{inc.status || 'Activ'}</span></td>
                            <td>{inc.dataEmitere ? new Date(inc.dataEmitere).toLocaleString('ro-RO').substring(0, 17) : ''}</td>
                            <td>{inc.descriereLocatie}</td>
                            <td>{inc.adresaIncident ? `${inc.adresaIncident.strada} ${inc.adresaIncident.numar}` : ''}</td>
                            <td>{inc.politistResponsabil ? `${inc.politistResponsabil.nume} ${inc.politistResponsabil.prenume}` : ''}</td>
                            <td>
                                <div className="action-buttons-container" style={{justifyContent:'center'}}>
                                    <button className="action-btn" style={{ backgroundColor: '#17a2b8', color: 'white' }} onClick={() => onViewClick(inc)}>Vezi</button>
                                    <button className="action-btn edit-btn" onClick={() => onEditClick(inc.idIncident)}>Edit</button>

                                    {/* BUTON DELETE SMART */}
                                    <button className="action-btn delete-btn" onClick={() => handleRequestDelete(inc.idIncident)}>Șterge</button>

                                    <button className="action-btn" style={{ backgroundColor: '#6f42c1', color: 'white', marginLeft: '5px' }} onClick={() => onManageParticipantsClick(inc.idIncident)}><i className="fa fa-users"></i> Pers</button>
                                </div>
                            </td>
                        </tr>
                    ))) : (<tr><td colSpan="7" style={{textAlign:'center', padding:'20px'}}>Nu există date.</td></tr>)}
                </tbody>
            </table>

            {!searchTerm && totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}

            {/* MODAL SMART RANDA IN LISTA */}
            <DeleteSmartModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                data={deleteData}
            />
        </div>
    );
};

export default IncidenteList;