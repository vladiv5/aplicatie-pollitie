import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles/TableStyles.css';

const ViewLocatariAdresa = ({ adresaId, onClose }) => {
    const [locatari, setLocatari] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (adresaId) {
            const token = localStorage.getItem('token');
            // Apelăm endpoint-ul nou
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
            <h3>Locatari (Persoane Asociate)</h3>

            {loading ? <p>Se încarcă...</p> : (
                <table className="styled-table" style={{ marginTop: '15px' }}>
                    <thead>
                    <tr>
                        <th>Nume</th>
                        <th>Prenume</th>
                        <th>CNP</th>
                        <th>Tip Locuire</th>
                    </tr>
                    </thead>
                    <tbody>
                    {locatari.map((item, index) => (
                        <tr key={index}>
                            {/* Accesăm datele din obiectul 'persoana' */}
                            <td>{item.persoana.nume}</td>
                            <td>{item.persoana.prenume}</td>
                            <td>{item.persoana.cnp}</td>
                            <td>
                                    <span style={{
                                        fontWeight: 'bold',
                                        color: item.tipAdresa === 'Domiciliu' ? 'blue' : 'green'
                                    }}>
                                        {item.tipAdresa}
                                    </span>
                            </td>
                        </tr>
                    ))}
                    {locatari.length === 0 && (
                        <tr>
                            <td colSpan="4" style={{textAlign: 'center'}}>
                                Nimeni nu este înregistrat la această adresă.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            )}

            <div className="modal-footer" style={{ marginTop: '20px' }}>
                <button className="action-btn" onClick={onClose} style={{ background: '#6c757d', color: 'white' }}>
                    Închideți
                </button>
            </div>
        </div>
    );
};

export default ViewLocatariAdresa;