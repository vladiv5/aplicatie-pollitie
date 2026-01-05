import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles/TableStyles.css';

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

            {loading ? <p>Se încarcă...</p> : (
                <table className="styled-table" style={{ marginTop: '15px' }}>
                    <thead>
                    <tr>
                        <th>Județ</th>
                        <th>Localitate</th>
                        <th>Stradă & Număr</th>
                        <th>Tip Adresă</th>
                    </tr>
                    </thead>
                    <tbody>
                    {listaAdrese.map((item, index) => (
                        <tr key={index}>
                            {/* Accesăm datele din obiectul 'adresa' */}
                            <td>{item.adresa.judetSauSector}</td>
                            <td>{item.adresa.localitate}</td>
                            <td>
                                {item.adresa.strada}
                                {item.adresa.numar ? `, Nr. ${item.adresa.numar}` : ''}
                                {item.adresa.bloc ? `, Bl. ${item.adresa.bloc}` : ''}
                                {item.adresa.apartament ? `, Ap. ${item.adresa.apartament}` : ''}
                            </td>
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
                    {listaAdrese.length === 0 && (
                        <tr>
                            <td colSpan="4" style={{textAlign: 'center'}}>
                                Această persoană nu are adrese asociate.
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

export default ViewAdresePersoana;