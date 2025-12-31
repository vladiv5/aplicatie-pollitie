import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Pagination from './Pagination';
import './styles/TableStyles.css';

const AmenziList = ({
                        refreshTrigger,
                        onAddClick,
                        onEditClick
                    }) => {
    // --- STATE ---
    const [amenzi, setAmenzi] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    // --- FETCH DATA ---
    const loadAmenzi = (page, term = '') => {
        const token = localStorage.getItem('token');

        // Default: Paginare server-side (sortat descrescator din backend)
        let url = `http://localhost:8080/api/amenzi/lista-paginata?page=${page}&size=10`;

        // Daca cautam: Endpoint Cautare
        if (term) {
            url = `http://localhost:8080/api/amenzi/cauta?termen=${term}`;
        }

        axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => {
                if(term) {
                    setAmenzi(res.data);
                    setTotalPages(1); // Fara paginare la cautare
                } else {
                    setAmenzi(res.data.content);
                    setTotalPages(res.data.totalPages);
                }
                setCurrentPage(page);
            })
            .catch(err => console.error("Eroare incarcare amenzi:", err));
    };

    // --- EFFECT ---
    useEffect(() => {
        loadAmenzi(currentPage, searchTerm);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshTrigger]);

    // --- HANDLERS ---
    const handlePageChange = (newPage) => {
        loadAmenzi(newPage, searchTerm);
    };

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        loadAmenzi(0, val);
    };

    const handleDelete = (id) => {
        if(window.confirm("Ești sigur că vrei să ștergi această amendă?")) {
            const token = localStorage.getItem('token');
            axios.delete(`http://localhost:8080/api/amenzi/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(() => {
                    loadAmenzi(currentPage, searchTerm);
                })
                .catch(err => alert("Eroare la ștergere!"));
        }
    };

    // Formatter data (dd/MM/yyyy HH:mm)
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
                <input
                    type="text"
                    className="search-input"
                    placeholder="Caută după motiv, persoană..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <button className="add-btn-primary" onClick={onAddClick}>
                    <span>+</span> Adaugă Amendă
                </button>
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
                        <tr key={amenda.idAmenda}>
                            <td>{amenda.motiv}</td>
                            <td style={{fontWeight: 'bold'}}>{amenda.suma}</td>
                            <td>
                            <span style={{
                                color: amenda.starePlata === 'Platita' ? 'green' : 'red',
                                fontWeight: 'bold'
                            }}>
                                {amenda.starePlata}
                            </span>
                            </td>
                            <td>{formatDataFrumos(amenda.dataEmitere)}</td>
                            <td>
                                {amenda.persoana
                                    ? `${amenda.persoana.nume} ${amenda.persoana.prenume}`
                                    : 'Nespecificat'}
                            </td>
                            <td>
                                {amenda.politist
                                    ? `${amenda.politist.nume} ${amenda.politist.prenume}`
                                    : 'Nespecificat'}
                            </td>
                            <td>
                                <div className="action-buttons-container" style={{justifyContent:'center'}}>
                                    <button
                                        className="action-btn edit-btn"
                                        onClick={() => onEditClick(amenda.idAmenda)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="action-btn delete-btn"
                                        onClick={() => handleDelete(amenda.idAmenda)}
                                    >
                                        Șterge
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

export default AmenziList;