import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Pagination from './Pagination'; // Asigura-te ca e importat corect
import './styles/TableStyles.css';

const PolitistiList = ({ refreshTrigger, onAddClick, onEditClick }) => {
    // STATE INTERN (Componenta e autonoma)
    const [politisti, setPolitisti] = useState([]);

    // Paginare & Sortare
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [sortBy, setSortBy] = useState('nume');

    // Cautare
    const [searchTerm, setSearchTerm] = useState('');

    // --- FETCH DATA ---
    const loadPolitisti = (page, term = '') => {
        const token = localStorage.getItem('token');
        let url = `http://localhost:8080/api/politisti/lista-paginata?page=${page}&size=10&sortBy=${sortBy}&dir=asc`;

        // Daca exista termen de cautare, schimbam endpoint-ul
        if (term) {
            url = `http://localhost:8080/api/politisti/cauta?termen=${term}`;
        }

        axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => {
                if(term) {
                    // Endpoint-ul de cautare returneaza List, nu Page
                    setPolitisti(res.data);
                    setTotalPages(1); // Ascundem paginarea la cautare
                } else {
                    // Endpoint-ul paginat returneaza Page
                    setPolitisti(res.data.content);
                    setTotalPages(res.data.totalPages);
                }
                setCurrentPage(page);
            })
            .catch(err => console.error("Eroare incarcare:", err));
    };

    // --- EFFECT ---
    // Se activeaza la: Mount, schimbare Pagina, schimbare RefreshTrigger (de la parinte)
    useEffect(() => {
        loadPolitisti(currentPage, searchTerm);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshTrigger]); // Daca parintele zice "Refresh", noi reincarcam

    // --- HANDLERS ---
    const handlePageChange = (newPage) => {
        loadPolitisti(newPage, searchTerm);
    };

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        // Cand scrii, resetam la pagina 0 si cautam
        loadPolitisti(0, val);
    };

    const handleDelete = (id) => {
        if(window.confirm("Ești sigur că vrei să ștergi acest polițist?")) {
            const token = localStorage.getItem('token');
            axios.delete(`http://localhost:8080/api/politisti/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(() => {
                    // Refresh la pagina curenta dupa stergere
                    loadPolitisti(currentPage, searchTerm);
                })
                .catch(err => alert("Eroare la ștergere!"));
        }
    };

    return (
        <div className="page-container">
            <h2 className="page-title">Gestiune Polițiști</h2>

            {/* ZONA DE CONTROLS (Search + Add) */}
            <div className="controls-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Caută după nume..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                />

                <button className="add-btn-primary" onClick={onAddClick}>
                    <span>+</span> Adaugă Polițist
                </button>
            </div>

            {/* TABELUL */}
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
                                        <button
                                            className="action-btn edit-btn"
                                            onClick={() => onEditClick(politist.idPolitist)}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => handleDelete(politist.idPolitist)}
                                            className="action-btn delete-btn"
                                        >
                                            Șterge
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>
                                Nu au fost găsite înregistrări.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* PAGINAREA (Randata tot de lista, ca e treaba ei) */}
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

export default PolitistiList;