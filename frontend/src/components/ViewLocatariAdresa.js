/**
 * Modal for displaying people residing at a specific address.
 * @author Ivan Vlad-Daniel
 * @version January 11, 2026
 */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles/Forms.css';

const ViewLocatariAdresa = ({ adresaId, onClose }) => {
    const [locatari, setLocatari] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (adresaId) {
            const token = localStorage.getItem('token');
            axios.get(`http://localhost:8080/api/adrese-persoane/adresa/${adresaId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => {
                    setLocatari(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [adresaId]);

    return (
        <div style={{ padding: '10px' }}>
            <h3 style={{ marginBottom: '15px', color: 'var(--royal-navy-dark)' }}>Associated Residents</h3>

            {loading ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading...</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="styled-table compact-table">
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Surname</th>
                            <th>CNP</th>
                            <th style={{textAlign: 'center'}}>Residency Type</th>
                        </tr>
                        </thead>
                        <tbody>
                        {locatari.map((item, index) => (
                            <tr key={index}>
                                <td>{item.persoana.nume}</td>
                                <td>{item.persoana.prenume}</td>
                                <td>{item.persoana.cnp}</td>
                                <td style={{textAlign: 'center'}}>
                                    <span className={`badge-status ${item.tipAdresa === 'Domiciliu' ? 'status-inchis' : 'status-activ'}`}
                                          style={{background: item.tipAdresa === 'Domiciliu' ? '#e0e7ff' : '#dcfce7', color: item.tipAdresa === 'Domiciliu' ? '#3730a3' : '#166534'}}>
                                        {item.tipAdresa}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {locatari.length === 0 && (
                            <tr>
                                <td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>
                                    No residents registered at this address.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="modal-footer">
                <button className="btn-close-modal" onClick={onClose}>CLOSE</button>
            </div>
        </div>
    );
};

export default ViewLocatariAdresa;