// src/pages/StatisticiPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const cardStyle = {
    flex: 1,
    padding: '15px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center',
    border: '1px solid #ddd'
};

const StatisticiPage = () => {
    const [statistici, setStatistici] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:8080/api/amenzi/statistici")
            .then(response => {
                setStatistici(response.data);
                console.log("Date primite: ", response.data);
            })
            .catch(error => {
                console.error("A apărut o eroare la preluarea datelor!", error);
            });
    }, []);

    // --- LOGICA REPARATĂ PENTRU CALCULE ---
    const nrAmenzi = statistici.length;

    // Am schimbat item.valoare în item.suma (pentru că așa e în tabelul tău)
    // Am adăugat Number() ca să fim siguri că facem matematică, nu lipire de texte
    const sumaTotala = statistici.reduce((acc, item) => {
        return acc + (Number(item.suma) || 0);
    }, 0);

    const medieAmenzi = nrAmenzi > 0 ? (sumaTotala / nrAmenzi).toFixed(2) : 0;

    // --- FUNCȚIE PENTRU FORMATRE DATĂ ---
    const formatareData = (dataBruta) => {
        if (!dataBruta) return "-";
        const d = new Date(dataBruta);
        // Returnează formatul: DD.MM.YYYY, HH:mm
        return d.toLocaleDateString('ro-RO') + ' ' + d.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Centru de Raportare si Statistici</h2>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>

                <div style={cardStyle}>
                    <h4>Total Amenzi</h4>
                    <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{nrAmenzi}</p>
                </div>

                <div style={cardStyle}>
                    <h4>Suma Totală</h4>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'green' }}>
                        {sumaTotala.toLocaleString('ro-RO')} RON
                    </p>
                </div>

                <div style={cardStyle}>
                    <h4>Valoare Medie</h4>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'blue' }}>
                        {medieAmenzi} RON
                    </p>
                </div>
            </div>

            <table border="1" style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
                <thead>
                <tr style={{ backgroundColor: '#f2f2f2' }}>
                    <th style={{ padding: '10px' }}>Agent</th>
                    <th style={{ padding: '10px' }}>Persoana Amendata</th>
                    <th style={{ padding: '10px' }}>Suma (RON)</th>
                    <th style={{ padding: '10px' }}>Data</th>
                </tr>
                </thead>
                <tbody>
                {statistici.map((item, index) => (
                    <tr key={index} style={{ textAlign: 'center' }}>
                        <td style={{ padding: '8px' }}>{item.numePolitist + " " + item.prenumePolitist}</td>
                        <td style={{ padding: '8px' }}>{item.numePersoana + " " + item.prenumePersoana}</td>
                        <td style={{ padding: '8px', fontWeight: 'bold' }}>{item.suma}</td>
                        {/* AICI AM APLICAT FORMATAREA DATEI */}
                        <td style={{ padding: '8px' }}>{formatareData(item.data_emitere)}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}

export default StatisticiPage;