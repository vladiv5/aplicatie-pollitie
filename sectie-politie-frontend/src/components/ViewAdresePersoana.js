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
                    <p>Se încarcă adresele...</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="styled-table compact-table">
                        <thead>
                        <tr>
                            <th>Localitate / Județ</th>
                            <th>Stradă & Număr</th>
                            <th style={{textAlign: 'center'}}>Tip</th>
                        </tr>
                        </thead>
                        <tbody>
                        {listaAdrese.map((item, index) => (
                            <tr key={index}>
                                <td>
                                    <div style={{fontWeight: '500'}}>{item.adresa.localitate}</div>
                                    <div style={{fontSize: '0.8rem', color: '#64748b'}}>{item.adresa.judetSauSector}</div>
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
                                               background: item.tipAdresa === 'Domiciliu' ? '#e0e7ff' : '#dcfce7',
                                               color: item.tipAdresa === 'Domiciliu' ? '#3730a3' : '#166534'
                                           }}>
                                        {item.tipAdresa}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {listaAdrese.length === 0 && (
                            <tr>
                                <td colSpan="3" style={{textAlign: 'center', padding: '20px', color: '#64748b'}}>
                                    Această persoană nu are adrese asociate.
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

export default ViewAdresePersoana;