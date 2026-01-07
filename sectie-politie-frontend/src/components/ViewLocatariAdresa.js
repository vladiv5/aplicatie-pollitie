import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles/Forms.css'; // Importăm pentru butonul de închidere

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
            <h3 style={{ marginBottom: '15px', color: 'var(--royal-navy-dark)' }}>Locatari Asociați</h3>

            {loading ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Se încarcă...</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="styled-table compact-table">
                        <thead>
                        <tr>
                            <th>Nume</th>
                            <th>Prenume</th>
                            <th>CNP</th>
                            <th style={{textAlign: 'center'}}>Tip Locuire</th>
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
                                    Nu există persoane înregistrate la această adresă.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="modal-footer">
                <button className="btn-close-modal" onClick={onClose}>
                    ÎNCHIDEȚI
                </button>
            </div>
        </div>
    );
};

export default ViewLocatariAdresa;