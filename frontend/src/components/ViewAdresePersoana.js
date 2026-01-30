/**
 * Modal for viewing all addresses associated with a person (Domicile, Residence).
 * @author Ivan Vlad-Daniel
 * @version January 11, 2026
 */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles/Forms.css';

const ViewAdresePersoana = ({ persoanaId, onClose }) => {
    const [listaAdrese, setListaAdrese] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (persoanaId) {
            const token = localStorage.getItem('token');
            axios.get(`http://localhost:8080/api/adrese-persoane/persoana/${persoanaId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => {
                    setListaAdrese(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [persoanaId]);

    return (
        <div style={{ padding: '10px' }}>
            {loading ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p style={{color:'#d4af37'}}>Loading addresses...</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="styled-table compact-table">
                        <thead>
                        <tr>
                            <th>City / County</th>
                            <th>Street & Number</th>
                            <th style={{textAlign: 'center'}}>Type</th>
                        </tr>
                        </thead>
                        <tbody>
                        {listaAdrese.map((item, index) => (
                            <tr key={index}>
                                <td>
                                    <div style={{fontWeight: '700', color: '#ffffff'}}>{item.adresa.localitate}</div>
                                    <div style={{fontSize: '0.8rem', color: '#d4af37'}}>{item.adresa.judetSauSector}</div>
                                </td>
                                <td>
                                    {item.adresa.strada}
                                    {item.adresa.numar ? `, Nr. ${item.adresa.numar}` : ''}
                                    {item.adresa.bloc ? `, Bl. ${item.adresa.bloc}` : ''}
                                    {item.adresa.apartament ? `, Ap. ${item.adresa.apartament}` : ''}
                                </td>
                                <td style={{textAlign: 'center'}}>
                                     <span className={`badge-status`}
                                           style={{
                                               // I visually differentiate Domicile from Residence using colors.
                                               background: item.tipAdresa === 'Domiciliu' ? 'rgba(124, 58, 237, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                               color: item.tipAdresa === 'Domiciliu' ? '#c4b5fd' : '#6ee7b7',
                                               border: item.tipAdresa === 'Domiciliu' ? '1px solid #8b5cf6' : '1px solid #10b981'
                                           }}>
                                        {item.tipAdresa}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {listaAdrese.length === 0 && (
                            <tr>
                                <td colSpan="3" style={{textAlign: 'center', padding: '20px', color: '#94a3b8', fontStyle: 'italic'}}>
                                    This person has no associated addresses.
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

export default ViewAdresePersoana;