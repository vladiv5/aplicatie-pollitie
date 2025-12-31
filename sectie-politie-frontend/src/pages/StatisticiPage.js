import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LiveSearchInput from '../components/LiveSearchInput'; // Importăm componenta ta de search
import '../components/styles/TableStyles.css';
import '../components/styles/Statistici.css';

const StatisticiPage = () => {
    // State pentru rapoartele statice
    const [topPolitisti, setTopPolitisti] = useState([]);
    const [topStrazi, setTopStrazi] = useState([]);
    const [rauPlatnici, setRauPlatnici] = useState([]);
    const [amenziGrad, setAmenziGrad] = useState([]);

    // State pentru rapoartele dinamice (interactive)
    // Acum stocăm direct ID-ul sau CNP-ul primit din LiveSearch
    const [selectedPolitistId, setSelectedPolitistId] = useState(null);
    const [rezultatPolitist, setRezultatPolitist] = useState(null);

    const [selectedCnp, setSelectedCnp] = useState(null);
    const [rezultatCnp, setRezultatCnp] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const config = { headers: { 'Authorization': `Bearer ${token}` } };

        // Încărcare date statice (Topuri)
        axios.get('http://localhost:8080/api/statistici/top-politisti', config).then(res => setTopPolitisti(res.data));
        axios.get('http://localhost:8080/api/statistici/top-strazi', config).then(res => setTopStrazi(res.data));
        axios.get('http://localhost:8080/api/statistici/rau-platnici', config).then(res => setRauPlatnici(res.data));
        axios.get('http://localhost:8080/api/statistici/amenzi-grad', config).then(res => setAmenziGrad(res.data));
    }, []);

    // Funcție Generare Raport 5 (Polițist)
    const handleCautaPolitist = () => {
        if(!selectedPolitistId) {
            alert("Te rog selectează un polițist din listă!");
            return;
        }
        const token = localStorage.getItem('token');
        axios.get(`http://localhost:8080/api/statistici/incidente-politist?id=${selectedPolitistId}`,
            { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => setRezultatPolitist(res.data))
            .catch(err => alert("Nu am găsit incidente pentru acest polițist."));
    };

    // Funcție Generare Raport 6 (CNP)
    const handleCautaCnp = () => {
        if(!selectedCnp) {
            alert("Te rog selectează o persoană din listă!");
            return;
        }
        const token = localStorage.getItem('token');
        axios.get(`http://localhost:8080/api/statistici/istoric-cnp?cnp=${selectedCnp}`,
            { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => setRezultatCnp(res.data))
            .catch(err => alert("Eroare la căutare CNP."));
    };

    return (
        <div className="stats-container">
            <h2 className="page-title">Panou de Rapoarte și Statistici</h2>

            {/* SECȚIUNEA 1: DASHBOARD STATIC (Grid 2x2) - RĂMÂNE NESCHIMBATĂ */}
            <div className="dashboard-grid">
                <div className="stat-card">
                    <h3>🏆 Top Polițiști (După valoarea amenzilor)</h3>
                    <table className="widget-table">
                        <thead><tr><th>Nume</th><th>Grad</th><th>Total (RON)</th></tr></thead>
                        <tbody>
                        {topPolitisti.map((p, idx) => (
                            <tr key={idx}>
                                <td>{p.nume} {p.prenume}</td>
                                <td>{p.grad}</td>
                                <td style={{fontWeight:'bold', color: 'green'}}>{p.total_valoare}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div className="stat-card">
                    <h3>🔥 Zone de Risc (Străzi cu incidente)</h3>
                    <table className="widget-table">
                        <thead><tr><th>Stradă</th><th>Localitate</th><th>Incidente</th></tr></thead>
                        <tbody>
                        {topStrazi.map((s, idx) => (
                            <tr key={idx}>
                                <td>{s.strada}</td>
                                <td>{s.localitate}</td>
                                <td style={{fontWeight:'bold', color: 'red'}}>{s.nr_incidente}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div className="stat-card">
                    <h3>⚠️ Top Rău-Platnici</h3>
                    <table className="widget-table">
                        <thead><tr><th>Nume</th><th>CNP</th><th>Datorie</th></tr></thead>
                        <tbody>
                        {rauPlatnici.map((rp, idx) => (
                            <tr key={idx}>
                                <td>{rp.nume} {rp.prenume}</td>
                                <td>{rp.cnp}</td>
                                <td style={{fontWeight:'bold', color: '#dc3545'}}>{rp.datorie_totala} Lei</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div className="stat-card">
                    <h3>📊 Eficiență per Grad</h3>
                    <table className="widget-table">
                        <thead><tr><th>Grad</th><th>Nr. Amenzi</th><th>Total</th></tr></thead>
                        <tbody>
                        {amenziGrad.map((g, idx) => (
                            <tr key={idx}>
                                <td>{g.grad}</td>
                                <td>{g.nr_amenzi}</td>
                                <td>{g.valoare_totala}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <hr style={{margin: '30px 0'}}/>

            {/* SECȚIUNEA 2: RAPOARTE INTERACTIVE CU LIVE SEARCH */}
            <h2 className="page-title">Rapoarte Detaliate (Căutare Avansată)</h2>

            {/* Raport 5: Incidente per Polițist */}
            <div className="interactive-section">
                <h3>👮 Activitate Polițist</h3>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', marginBottom: '20px' }}>
                    <div style={{ flex: 1 }}>
                        {/* AICI FOLOSIM LiveSearchInput PENTRU POLIȚIȘTI */}
                        <LiveSearchInput
                            label="Caută Polițist (Nume/Prenume)"
                            placeholder="Scrie numele polițistului..."
                            apiUrl="http://localhost:8080/api/politisti/cauta"
                            // Aici facem formatarea șmecheră: Nume + Grad + Funcție
                            displayKey={(p) => `${p.nume} ${p.prenume} (${p.grad} - ${p.functie})`}
                            onSelect={(item) => setSelectedPolitistId(item ? item.idPolitist : null)}
                        />
                    </div>
                    <button
                        className="search-btn"
                        onClick={handleCautaPolitist}
                        style={{ height: '42px', marginBottom: '15px' }} // Aliniere vizuală cu inputul
                    >
                        Generează Raport
                    </button>
                </div>

                {rezultatPolitist && (
                    <table className="styled-table">
                        <thead><tr><th>Tip Incident</th><th>Data</th><th>Locație</th><th>Adresa</th></tr></thead>
                        <tbody>
                        {rezultatPolitist.length > 0 ? rezultatPolitist.map((i, idx) => (
                            <tr key={idx}>
                                <td>{i.tip_incident}</td>
                                <td>{i.data_emitere ? i.data_emitere.replace('T', ' ') : '-'}</td>
                                <td>{i.descriere_locatie}</td>
                                <td>{i.strada}</td>
                            </tr>
                        )) : <tr><td colSpan="4" style={{textAlign:'center'}}>Acest polițist nu are incidente înregistrate.</td></tr>}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Raport 6: Istoric CNP */}
            <div className="interactive-section">
                <h3>👤 Istoric Amenzi Cetățean</h3>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', marginBottom: '20px' }}>
                    <div style={{ flex: 1 }}>
                        {/* AICI FOLOSIM LiveSearchInput PENTRU CETĂȚENI */}
                        <LiveSearchInput
                            label="Caută Cetățean (Nume sau CNP)"
                            placeholder="Scrie nume sau CNP..."
                            apiUrl="http://localhost:8080/api/persoane/cauta"
                            // Formatare: Nume + CNP în paranteză
                            displayKey={(p) => `${p.nume} ${p.prenume} (CNP: ${p.cnp})`}
                            onSelect={(item) => setSelectedCnp(item ? item.cnp : null)}
                        />
                    </div>
                    <button
                        className="search-btn"
                        onClick={handleCautaCnp}
                        style={{ height: '42px', marginBottom: '15px' }}
                    >
                        Generează Raport
                    </button>
                </div>

                {rezultatCnp && (
                    <table className="styled-table">
                        <thead><tr><th>Motiv</th><th>Suma</th><th>Stare</th><th>Agent Constatator</th></tr></thead>
                        <tbody>
                        {rezultatCnp.length > 0 ? rezultatCnp.map((a, idx) => (
                            <tr key={idx}>
                                <td>{a.motiv}</td>
                                <td style={{fontWeight:'bold'}}>{a.suma} RON</td>
                                <td style={{color: a.stare_plata === 'Platita' ? 'green' : 'red', fontWeight:'bold'}}>
                                    {a.stare_plata}
                                </td>
                                <td>{a.nume_politist} {a.prenume_politist}</td>
                            </tr>
                        )) : <tr><td colSpan="4" style={{textAlign:'center'}}>Nu există amenzi pentru această persoană.</td></tr>}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default StatisticiPage;