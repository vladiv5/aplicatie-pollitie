import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Pagination from './Pagination';
import './styles/TableStyles.css';

const IncidenteList = ({
                           refreshTrigger,
                           onAddClick,
                           onEditClick,
                           onViewClick,
                           onManageParticipantsClick // Butonul mov pentru participanti
                       }) => {
    // --- STATE ---
    const [incidente, setIncidente] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    // --- FETCH DATA ---
    const loadIncidente = (page, term = '') => {
        const token = localStorage.getItem('token');

        // Default: Paginare server-side (sortat descrescator din backend)
        let url = `http://localhost:8080/api/incidente/lista-paginata?page=${page}&size=10`;

        // Daca cautam: Endpoint Cautare
        if (term) {
            url = `http://localhost:8080/api/incidente/cauta?termen=${term}`;
        }

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
            .catch(err => console.error("Eroare incarcare incidente:", err));
    };

    // --- EFFECT ---
    useEffect(() => {
        loadIncidente(currentPage, searchTerm);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshTrigger]);

    // --- HANDLERS ---
    const handlePageChange = (newPage) => {
        loadIncidente(newPage, searchTerm);
    };

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        loadIncidente(0, val);
    };

    const handleDelete = (id) => {
        if(window.confirm("Ești sigur că vrei să ștergi acest incident?")) {
            const token = localStorage.getItem('token');
            axios.delete(`http://localhost:8080/api/incidente/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(() => {
                    loadIncidente(currentPage, searchTerm);
                })
                .catch(err => alert("Eroare la ștergere!"));
        }
    };

    return (
        <div className="page-container">
            <h2 className="page-title">Registru Incidente</h2>

            <div className="controls-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Caută după tip, locație..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <button className="add-btn-primary" onClick={onAddClick}>
                    <span>+</span> Adaugă Incident
                </button>
            </div>

            <table className="styled-table">
                <thead>
                <tr>
                    <th>Tip</th>
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
                            <td>
                                {inc.dataEmitere
                                    ? new Date(inc.dataEmitere).toLocaleString('ro-RO').substring(0, 17)
                                    : '-'}
                            </td>
                            <td>{inc.descriereLocatie}</td>
                            <td>
                                {inc.adresaIncident
                                    ? `${inc.adresaIncident.strada} ${inc.adresaIncident.numar}`
                                    : '-'}
                            </td>
                            <td>
                                {inc.politistResponsabil
                                    ? `${inc.politistResponsabil.nume} ${inc.politistResponsabil.prenume}`
                                    : 'Nealocat'}
                            </td>
                            <td>
                                <div className="action-buttons-container" style={{justifyContent:'center'}}>
                                    <button
                                        className="action-btn"
                                        style={{ backgroundColor: '#17a2b8', color: 'white' }}
                                        onClick={() => onViewClick(inc)}
                                        title="Vezi Detalii"
                                    >
                                        Vezi
                                    </button>

                                    <button
                                        className="action-btn edit-btn"
                                        onClick={() => onEditClick(inc.idIncident)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="action-btn delete-btn"
                                        onClick={() => handleDelete(inc.idIncident)}
                                    >
                                        Șterge
                                    </button>

                                    <button
                                        className="action-btn"
                                        style={{ backgroundColor: '#6f42c1', color: 'white', marginLeft: '5px' }}
                                        onClick={() => onManageParticipantsClick(inc.idIncident)}
                                        title="Gestionează Participanți"
                                    >
                                        <i className="fa fa-users"></i> Pers
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
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};

export default IncidenteList;