import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Pagination from './Pagination';
import './styles/TableStyles.css';

const PersoaneList = ({
                          refreshTrigger,
                          onAddClick,
                          onEditClick,
                          onViewHistoryClick,
                          onViewAdreseClick
                      }) => {
    // --- STATE INTERN ---
    const [persoane, setPersoane] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    // Sortare default
    const [sortBy] = useState('nume');

    // --- FETCH DATA ---
    const loadPersoane = (page, term = '') => {
        const token = localStorage.getItem('token');

        // Default: Paginare Server-Side
        let url = `http://localhost:8080/api/persoane/lista-paginata?page=${page}&size=10&sortBy=${sortBy}&dir=asc`;

        // Daca cautam: Endpoint Cautare (fara paginare server-side momentan)
        if (term) {
            url = `http://localhost:8080/api/persoane/cauta?termen=${term}`;
        }

        axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => {
                if(term) {
                    setPersoane(res.data);
                    setTotalPages(1); // Ascundem paginarea la cautare
                } else {
                    setPersoane(res.data.content);
                    setTotalPages(res.data.totalPages);
                }
                setCurrentPage(page);
            })
            .catch(err => console.error("Eroare incarcare persoane:", err));
    };

    // --- EFFECT (Mount + Refresh) ---
    useEffect(() => {
        loadPersoane(currentPage, searchTerm);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshTrigger]);

    // --- HANDLERS ---
    const handlePageChange = (newPage) => {
        loadPersoane(newPage, searchTerm);
    };

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        loadPersoane(0, val);
    };

    const handleDelete = (id) => {
        if(window.confirm("Ești sigur că vrei să ștergi această persoană?")) {
            const token = localStorage.getItem('token');
            axios.delete(`http://localhost:8080/api/persoane/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(() => {
                    loadPersoane(currentPage, searchTerm);
                })
                .catch(err => alert("Nu se poate șterge (posibil are istoric)!"));
        }
    };

    const formatDataNasterii = (dateString) => {
        if (!dateString) return '-';
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
                    placeholder="Caută după nume, prenume sau CNP..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <button className="add-btn-primary" onClick={onAddClick}>
                    <span>+</span> Adaugă Persoană
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
                        <tr key={p.idPersoana}>
                            <td>{p.nume}</td>
                            <td>{p.prenume}</td>
                            <td>{p.cnp}</td>
                            <td style={{ textAlign: 'center' }}>{formatDataNasterii(p.dataNasterii)}</td>
                            <td>{p.telefon}</td>
                            <td>
                                <div className="action-buttons-container" style={{justifyContent:'center'}}>
                                    <button className="action-btn edit-btn" onClick={() => onEditClick(p.idPersoana)}>Edit</button>
                                    <button className="action-btn delete-btn" onClick={() => handleDelete(p.idPersoana)}>Șterge</button>

                                    <button className="action-btn"
                                            style={{ backgroundColor: '#17a2b8', color: 'white', marginRight: '5px' }}
                                            onClick={() => onViewHistoryClick(p.idPersoana)}
                                            title="Vezi Istoric"
                                    >
                                        <i className="fa fa-history"></i> Istoric
                                    </button>

                                    <button className="action-btn"
                                            style={{ backgroundColor: '#28a745', color: 'white', marginRight: '5px' }}
                                            onClick={() => onViewAdreseClick(p.idPersoana)}
                                            title="Vezi Adrese"
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
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};

export default PersoaneList;