import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Pagination from './Pagination';
import './styles/TableStyles.css';

const AdreseList = ({
                        refreshTrigger,
                        onAddClick,
                        onEditClick,
                        onViewLocatariClick // Butonul Portocaliu
                    }) => {
    // --- STATE ---
    const [adrese, setAdrese] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    // --- FETCH DATA ---
    const loadAdrese = (page, term = '') => {
        const token = localStorage.getItem('token');

        // Default: Paginare server-side (sortat complex din backend)
        let url = `http://localhost:8080/api/adrese/lista-paginata?page=${page}&size=10`;

        // Daca cautam: Endpoint Cautare
        if (term) {
            url = `http://localhost:8080/api/adrese/cauta?termen=${term}`;
        }

        axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => {
                if(term) {
                    setAdrese(res.data);
                    setTotalPages(1); // Fara paginare la cautare
                } else {
                    setAdrese(res.data.content);
                    setTotalPages(res.data.totalPages);
                }
                setCurrentPage(page);
            })
            .catch(err => console.error("Eroare incarcare adrese:", err));
    };

    // --- EFFECT ---
    useEffect(() => {
        loadAdrese(currentPage, searchTerm);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshTrigger]);

    // --- HANDLERS ---
    const handlePageChange = (newPage) => {
        loadAdrese(newPage, searchTerm);
    };

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        loadAdrese(0, val);
    };

    const handleDelete = (id) => {
        if(window.confirm("Ești sigur că vrei să ștergi această adresă?")) {
            const token = localStorage.getItem('token');
            axios.delete(`http://localhost:8080/api/adrese/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(() => {
                    loadAdrese(currentPage, searchTerm);
                })
                .catch(err => alert("Nu se poate șterge adresa (posibil are locatari sau incidente)!"));
        }
    };

    return (
        <div className="page-container">
            <h2 className="page-title">Registru Adrese</h2>

            <div className="controls-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Caută după stradă, localitate..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <button className="add-btn-primary" onClick={onAddClick}>
                    <span>+</span> Adaugă Adresă
                </button>
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
                            <td>{adresa.numar ? adresa.numar : '-'}</td>
                            <td>{adresa.bloc ? adresa.bloc : '-'}</td>
                            <td>{adresa.apartament ? adresa.apartament : '-'}</td>
                            <td>
                                <div className="action-buttons-container" style={{justifyContent:'center'}}>
                                    <button
                                        className="action-btn edit-btn"
                                        onClick={() => onEditClick(adresa.idAdresa)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="action-btn delete-btn"
                                        onClick={() => handleDelete(adresa.idAdresa)}
                                    >
                                        Șterge
                                    </button>
                                    <button
                                        className="action-btn"
                                        style={{ backgroundColor: '#fd7e14', color: 'white', marginRight: '5px' }}
                                        onClick={() => onViewLocatariClick(adresa.idAdresa)}
                                        title="Vezi Locatari"
                                    >
                                        <i className="fa fa-users"></i> Locatari
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))) : (
                    <tr><td colSpan="7" style={{textAlign:'center', padding:'20px'}}>Nu există date.</td></tr>
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

export default AdreseList;