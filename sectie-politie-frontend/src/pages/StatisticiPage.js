import React, { useEffect, useState } from 'react';
import axios from 'axios';

import LiveSearchInput from '../components/LiveSearchInput';
import PaginatedCard from '../components/PaginatedCard';
import '../components/styles/TableStyles.css';
import '../components/styles/Statistici.css';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560'];

// --- PARSARE SI FORMATARE DATE ---
const parseUserDate = (input) => {
    if (!input || input.trim() === '') return null;
    const cleanInput = input.replace(/[./]/g, '-');
    const parts = cleanInput.split('-');
    if (parts.length !== 3) return 'INVALID';
    let day = parseInt(parts[0], 10);
    let month = parseInt(parts[1], 10);
    let year = parseInt(parts[2], 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return 'INVALID';
    if (day < 1 || day > 31) return 'INVALID';
    if (month < 1 || month > 12) return 'INVALID';
    if (year < 1900 || year > 2100) return 'INVALID';
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const formatDateDisplay = (isoDate) => {
    if (!isoDate) return '-';
    const datePart = isoDate.toString().split('T')[0];
    const parts = datePart.split('-');
    if (parts.length !== 3) return isoDate;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

// --- TOOLTIP PERSONALIZAT PENTRU GRAFICE ---
const CustomChartTooltip = ({ active, payload, label, type }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload; // Datele complete ale barei

        return (
            <div className="custom-tooltip-box" style={{visibility:'visible', opacity:1, position:'relative', bottom:'auto', left:'auto', transform:'none', margin:0}}>
                {/* Header comun */}
                <div style={{fontWeight:'bold', borderBottom:'1px solid rgba(255,255,255,0.2)', marginBottom:'5px', paddingBottom:'3px'}}>
                    {data.nume ? `${data.nume} ${data.prenume || ''}` : label}
                </div>

                {/* Continut specific */}
                {type === 'politist' && (
                    <>
                        <div>Funcție: {data.functie}</div>
                        <div>Grad: {data.grad}</div>
                        <div style={{marginTop:'5px', color:'#ffd700'}}>
                            Total Amenzi: {data.total_valoare} RON
                        </div>
                    </>
                )}

                {type === 'persoana' && (
                    <>
                        <div>CNP: {data.cnp}</div>
                        <div style={{marginTop:'5px', color:'#ff6b6b'}}>
                            Datorie: {data.datorie_totala} RON
                        </div>
                    </>
                )}

                {type === 'strada' && (
                    <>
                        <div style={{color:'#4dabf7'}}>
                            Incidente: {data.nr_incidente}
                        </div>
                    </>
                )}
            </div>
        );
    }
    return null;
};

const StatisticiPage = () => {
    const [startInput, setStartInput] = useState('');
    const [endInput, setEndInput] = useState('');
    const [dateError, setDateError] = useState('');
    const [activeStartDate, setActiveStartDate] = useState(null);
    const [activeEndDate, setActiveEndDate] = useState(null);

    // State Grafice
    const [topPolitisti, setTopPolitisti] = useState([]);
    const [amenziGrad, setAmenziGrad] = useState([]);
    const [topStrazi, setTopStrazi] = useState([]);
    const [rauPlatnici, setRauPlatnici] = useState([]);

    // State Carduri
    const [zoneSigure, setZoneSigure] = useState([]);
    const [agentiSeveri, setAgentiSeveri] = useState([]);
    const [recidivisti, setRecidivisti] = useState([]);
    const [zileCritice, setZileCritice] = useState([]);

    const [currentSlide, setCurrentSlide] = useState(0);

    // State Dosare
    const [selectedPolitist, setSelectedPolitist] = useState(null);
    const [rezultatPolitist, setRezultatPolitist] = useState(null);
    const [selectedPersoana, setSelectedPersoana] = useState(null);
    const [rezultatCnp, setRezultatCnp] = useState(null);

    const fetchAllData = () => {
        const token = localStorage.getItem('token');
        const config = {
            headers: { 'Authorization': `Bearer ${token}` },
            params: { start: activeStartDate, end: activeEndDate }
        };

        setDateError('');

        axios.get('http://localhost:8080/api/statistici/top-politisti', config).then(res => setTopPolitisti(res.data));
        axios.get('http://localhost:8080/api/statistici/amenzi-grad', config).then(res => setAmenziGrad(res.data));
        axios.get('http://localhost:8080/api/statistici/top-strazi', config).then(res => setTopStrazi(res.data));
        axios.get('http://localhost:8080/api/statistici/rau-platnici', config).then(res => setRauPlatnici(res.data));

        axios.get('http://localhost:8080/api/statistici/zone-sigure', config).then(res => setZoneSigure(res.data));
        axios.get('http://localhost:8080/api/statistici/agenti-severi', config).then(res => setAgentiSeveri(res.data));
        axios.get('http://localhost:8080/api/statistici/recidivisti', config).then(res => setRecidivisti(res.data));
        axios.get('http://localhost:8080/api/statistici/zile-critice', config).then(res => setZileCritice(res.data));
    };

    useEffect(() => {
        fetchAllData();
    }, [activeStartDate, activeEndDate]);

    const handleApplyFilters = () => {
        const parsedStart = parseUserDate(startInput);
        const parsedEnd = parseUserDate(endInput);

        if (parsedStart === 'INVALID' || parsedEnd === 'INVALID') {
            setDateError('Format dată invalid! Folosește formatul: ZZ.LL.AAAA');
            return;
        }
        if (parsedStart && parsedEnd && parsedStart > parsedEnd) {
            setDateError('Data de început nu poate fi după data de sfârșit!');
            return;
        }

        setActiveStartDate(parsedStart);
        setActiveEndDate(parsedEnd);
        setDateError('');

        if (selectedPolitist) handleCautaPolitist(parsedStart, parsedEnd);
        if (selectedPersoana) handleCautaCnp(parsedStart, parsedEnd);
    };

    const handleReset = () => {
        setStartInput('');
        setEndInput('');
        setActiveStartDate(null);
        setActiveEndDate(null);
        setDateError('');
        setRezultatPolitist(null);
        setRezultatCnp(null);
    };

    // --- CONFIGURARE SLIDE-URI (GRAFICE) ---
    const slides = [
        {
            id: 0, title: "🏆 Top Polițiști (Valoare Amenzi)",
            component: (
                <ResponsiveContainer width="100%" height={350}>
                    {/* Folosim slice(0, 10) pentru a limita la primii 10 */}
                    <BarChart data={topPolitisti.slice(0, 20)} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                        <CartesianGrid strokeDasharray="3 3" />

                        {/* Axa X arata Nume + Prenume */}
                        <XAxis
                            dataKey={(row) => `${row.nume} ${row.prenume}`}
                            tick={{fontSize: 11}}
                            angle={-20}
                            textAnchor="end"
                            interval={0}
                        />
                        <YAxis />

                        {/* Tooltip Personalizat Politist */}
                        <Tooltip content={<CustomChartTooltip type="politist"/>} />

                        <Legend wrapperStyle={{paddingTop: '20px'}}/>
                        <Bar dataKey="total_valoare" fill="#007bff" name="Total RON Generat" barSize={40} radius={[5, 5, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 1, title: "🧩 Distribuție Amenzi pe Grade",
            component: (
                <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                        <Pie data={amenziGrad} cx="50%" cy="50%" labelLine={true} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={120} fill="#8884d8" dataKey="valoare_totala" nameKey="grad">
                            {amenziGrad.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value} RON`} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 2, title: "🔥 Top 20 Străzi (Zone de Risc)",
            component: (
                <ResponsiveContainer width="100%" height={350}>
                    {/* 1. Am scos layout="vertical" si am marit marginea de jos pt text */}
                    <BarChart data={topStrazi.slice(0, 20)} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                        <CartesianGrid strokeDasharray="3 3" />

                        {/* 2. AXA X: Acum afișează Strada (rotită să încapă) */}
                        <XAxis
                            dataKey="strada"
                            tick={{fontSize: 11}}
                            angle={-45}
                            textAnchor="end"
                            interval={0}
                        />

                        {/* 3. AXA Y: Acum afișează Numerele (automat) */}
                        <YAxis />

                        <Tooltip content={<CustomChartTooltip type="strada"/>} />
                        <Legend wrapperStyle={{paddingTop: '20px'}}/>

                        {/* Barele sunt acum verticale */}
                        <Bar dataKey="nr_incidente" fill="#dc3545" name="Nr. Incidente" barSize={30} radius={[5, 5, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 3, title: "⚠️ Top Rău-Platnici",
            component: (
                <ResponsiveContainer width="100%" height={350}>
                    {/* Limitare la 10 persoane */}
                    <BarChart data={rauPlatnici.slice(0, 20)} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                        <CartesianGrid strokeDasharray="3 3" />

                        {/* Axa X arata Nume + Prenume */}
                        <XAxis
                            dataKey={(row) => `${row.nume} ${row.prenume}`}
                            tick={{fontSize: 11}}
                            angle={-20}
                            textAnchor="end"
                            interval={0}
                        />
                        <YAxis />

                        {/* Tooltip Personalizat Persoana (cu CNP) */}
                        <Tooltip content={<CustomChartTooltip type="persoana"/>} />

                        <Legend wrapperStyle={{paddingTop: '20px'}}/>
                        <Bar dataKey="datorie_totala" fill="#FF8042" name="Datorie (RON)" barSize={40} radius={[5, 5, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            )
        }
    ];

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    // --- DOSARE HANDLERS ---
    const handleCautaPolitist = (startOverride = activeStartDate, endOverride = activeEndDate) => {
        if(!selectedPolitist) return;
        const token = localStorage.getItem('token');
        const config = { headers: { 'Authorization': `Bearer ${token}` }, params: { id: selectedPolitist.idPolitist, start: startOverride, end: endOverride } };
        axios.get(`http://localhost:8080/api/statistici/incidente-politist`, config)
            .then(res => setRezultatPolitist(res.data))
            .catch(() => toast.error("Fără date."));
    };

    const handleCautaCnp = (startOverride = activeStartDate, endOverride = activeEndDate) => {
        if(!selectedPersoana) return;
        const token = localStorage.getItem('token');
        const config = { headers: { 'Authorization': `Bearer ${token}` }, params: { cnp: selectedPersoana.cnp, start: startOverride, end: endOverride } };
        axios.get(`http://localhost:8080/api/statistici/istoric-cnp`, config)
            .then(res => setRezultatCnp(res.data))
            .catch(() => toast.error("Fără date."));
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="stats-container">
            <h2 className="page-title">Dashboard Analitic & Statistici</h2>

            <div className="command-bar">
                <div className="filter-container">
                    <div className="filter-group">
                        <label>Data Început:</label>
                        <input type="text" className="date-input-text" placeholder="ZZ-LL-AAAA" value={startInput} onChange={(e) => setStartInput(e.target.value)} />
                    </div>
                    <div className="filter-group">
                        <label>Data Sfârșit:</label>
                        <input type="text" className="date-input-text" placeholder="ZZ-LL-AAAA" value={endInput} onChange={(e) => setEndInput(e.target.value)} />
                    </div>
                    <button className="apply-btn" onClick={handleApplyFilters}>🔍 Aplică Filtre</button>
                    <button className="reset-btn" onClick={handleReset}>↺ Reset</button>
                </div>
            </div>

            <div style={{textAlign: 'center', marginBottom: '30px', minHeight:'20px'}}>
                {dateError ? (<span style={{color: '#dc3545', fontWeight:'bold'}}>⚠️ {dateError}</span>) :
                    (<span style={{color: '#666', fontStyle: 'italic'}}>{activeStartDate && activeEndDate ? `📊 Analiză activă: ${formatDateDisplay(activeStartDate)} ➔ ${formatDateDisplay(activeEndDate)}` : "📊 Se afișează istoricul complet (All Time)"}</span>)}
            </div>

            <div className="carousel-container">
                <button className="nav-arrow nav-prev" onClick={prevSlide}>&#10094;</button>
                <div className="carousel-content" key={currentSlide}>
                    <h3 className="slide-title">{slides[currentSlide].title}</h3>
                    {slides[currentSlide].component}
                </div>
                <button className="nav-arrow nav-next" onClick={nextSlide}>&#10095;</button>
                <div className="slide-indicator">{slides.map((_, idx) => (<div key={idx} className={`dot ${currentSlide === idx ? 'active' : ''}`} onClick={() => setCurrentSlide(idx)}></div>))}</div>
            </div>

            {/* --- ANALYSIS GRID --- */}
            <div className="analysis-grid">

                {/* 1. Zone Sigure */}
                <PaginatedCard
                    title="Zone Sigure"
                    icon="🛡️"
                    colorClass="card-green"
                    data={zoneSigure}
                    itemsPerPage={5}
                    renderItem={(item, idx) => (
                        <tr key={idx}>
                            <td>
                                <div className="tooltip-wrapper">
                                    <span className="truncated-text">
                                        {item.strada}, {item.localitate}
                                    </span>
                                    <div className="custom-tooltip-box">
                                        Localitate: {item.localitate}{'\n'}
                                        Strada: {item.strada}
                                    </div>
                                </div>
                            </td>
                        </tr>
                    )}
                />

                {/* 2. Agenți Severi */}
                <PaginatedCard
                    title="Agenți Severi"
                    icon="👮"
                    colorClass="card-orange"
                    data={agentiSeveri}
                    itemsPerPage={5}
                    renderItem={(item, idx) => (
                        <tr key={idx}>
                            <td>
                                <div className="tooltip-wrapper">
                                    <span className="truncated-text">
                                        <b>{item.nume} {item.prenume}</b><br/>
                                        <span style={{fontSize:'11px', opacity:0.8}}>{item.grad}, {item.functie}</span>
                                    </span>
                                    <div className="custom-tooltip-box">
                                        Nume: {item.nume} {item.prenume}{'\n'}
                                        Grad: {item.grad}{'\n'}
                                        Funcție: {item.functie}
                                    </div>
                                </div>
                            </td>
                            <td style={{fontWeight:'bold', textAlign:'right'}}>
                                {parseFloat(item.medie_personala).toFixed(0)} RON
                            </td>
                        </tr>
                    )}
                />

                {/* 3. Recidiviști */}
                <PaginatedCard
                    title="Recidiviști"
                    icon="⚠️"
                    colorClass="card-red"
                    data={recidivisti}
                    itemsPerPage={5}
                    renderItem={(item, idx) => (
                        <tr key={idx}>
                            <td>
                                <div className="tooltip-wrapper">
                                    <span className="truncated-text">
                                        <b>{item.nume} {item.prenume}</b><br/>
                                        <span style={{fontSize:'11px', opacity:0.8}}>CNP: {item.cnp}</span>
                                    </span>
                                    <div className="custom-tooltip-box">
                                        Nume: {item.nume} {item.prenume}{'\n'}
                                        CNP: {item.cnp}
                                    </div>
                                </div>
                            </td>
                            <td style={{color:'red', fontWeight:'bold', textAlign:'right'}}>
                                {item.nr_abateri} abateri
                            </td>
                        </tr>
                    )}
                />

                {/* 4. Zile Critice */}
                <PaginatedCard
                    title="Zile Critice"
                    icon="📅"
                    colorClass="card-blue"
                    data={zileCritice}
                    itemsPerPage={5}
                    renderItem={(item, idx) => (
                        <tr key={idx}>
                            <td>{formatDateDisplay(item.ziua)}</td>
                            <td style={{fontWeight:'bold', textAlign:'right'}}>{item.nr_incidente} incidente</td>
                        </tr>
                    )}
                />
            </div>

            {/* --- ARHIVA OPERATIVA (DOSARE) --- */}
            <h2 className="page-title" style={{marginTop:'50px'}}>📂 Arhivă Operativă (Dosare)</h2>

            <div className="dashboard-grid">
                {/* DOSAR POLITIST */}
                <div>
                    <div className="search-wrapper">
                        <div style={{flex:1}}>
                            <LiveSearchInput
                                label="Căutați Polițist"
                                placeholder="Nume, Prenume..."
                                apiUrl="http://localhost:8080/api/politisti/cauta"
                                displayKey={(p) => `${p.nume} ${p.prenume} (${p.grad} - ${p.functie})`}
                                onSelect={(item) => setSelectedPolitist(item)}
                            />
                        </div>
                        <button className="search-btn-modern" onClick={() => handleCautaPolitist()}>
                            🔍 Deschide Dosar
                        </button>
                    </div>
                    {rezultatPolitist && selectedPolitist && (
                        <div className="dossier-card">
                            <div className="dossier-top-bar"></div>
                            <div className="stamp">DOSAR PERSONAL</div>
                            <div className="dossier-header">
                                <div className="dossier-photo-placeholder">FOTO</div>
                                <div className="dossier-info" style={{flex:1, marginLeft:'20px'}}>
                                    <h2>{selectedPolitist.nume} {selectedPolitist.prenume}</h2>
                                    <div className="dossier-detail"><b>Grad:</b> {selectedPolitist.grad}</div>
                                    <div className="dossier-detail"><b>Funcție:</b> {selectedPolitist.functie}</div>
                                    <div className="dossier-detail"><b>Telefon:</b> {selectedPolitist.telefon_serviciu}</div>
                                    <div className="dossier-detail"><b>ID Serviciu:</b> {selectedPolitist.idPolitist}</div>
                                </div>
                            </div>
                            <h4 style={{borderBottom:'1px solid #333'}}>RAPORT DE ACTIVITATE (INCIDENTE GESTIONATE)</h4>
                            {rezultatPolitist.length > 0 ? (
                                <table className="dossier-table">
                                    <thead><tr><th>Dată</th><th>Tip Incident</th><th>Locație</th></tr></thead>
                                    <tbody>
                                    {rezultatPolitist.map((r, i) => (
                                        <tr key={i}>
                                            <td>{formatDateDisplay(r.data_emitere)}</td>
                                            <td>{r.tip_incident}</td>
                                            <td>{r.descriere_locatie}, {r.strada}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            ) : <p>Nu există activitate înregistrată în perioada selectată.</p>}
                            <button className="print-btn" onClick={handlePrint}>🖨️ Printează Dosar</button>
                        </div>
                    )}
                </div>

                {/* DOSAR CETATEAN */}
                <div>
                    <div className="search-wrapper">
                        <div style={{flex:1}}>
                            <LiveSearchInput
                                label="Căutați Cetățean"
                                placeholder="Nume sau CNP..."
                                apiUrl="http://localhost:8080/api/persoane/cauta"
                                displayKey={(p) => `${p.nume} ${p.prenume} (CNP: ${p.cnp})`}
                                onSelect={(item) => setSelectedPersoana(item)}
                            />
                        </div>
                        <button className="search-btn-modern" onClick={() => handleCautaCnp()}>
                            🔍 Deschide Dosar
                        </button>
                    </div>
                    {rezultatCnp && selectedPersoana && (
                        <div className="dossier-card">
                            <div className="dossier-top-bar"></div>
                            <div className="stamp">CAZIER FISCAL</div>
                            <div className="dossier-header">
                                <div className="dossier-photo-placeholder">FOTO</div>
                                <div className="dossier-info" style={{flex:1, marginLeft:'20px'}}>
                                    <h2>{selectedPersoana.nume} {selectedPersoana.prenume}</h2>
                                    <div className="dossier-detail"><b>CNP:</b> {selectedPersoana.cnp}</div>
                                    <div className="dossier-detail"><b>Telefon:</b> {selectedPersoana.telefon}</div>
                                    <div className="dossier-detail"><b>Data Nașterii:</b> {formatDateDisplay(selectedPersoana.dataNasterii)}</div>
                                </div>
                            </div>
                            <h4 style={{borderBottom:'1px solid #333'}}>ISTORIC AMENZI & SANCȚIUNI</h4>
                            {rezultatCnp.length > 0 ? (
                                <table className="dossier-table">
                                    <thead><tr><th>Dată</th><th>Motiv</th><th>Sumă</th><th>Status</th><th>Agent</th></tr></thead>
                                    <tbody>
                                    {rezultatCnp.map((r, i) => (
                                        <tr key={i}>
                                            <td>{formatDateDisplay(r.data_emitere)}</td>
                                            <td>{r.motiv}</td>
                                            <td style={{fontWeight:'bold'}}>{r.suma} RON</td>
                                            <td style={{color: r.stare_plata === 'Platita' ? 'green' : 'red', fontWeight:'bold'}}>{r.stare_plata}</td>
                                            <td>{r.nume_politist} {r.prenume_politist}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            ) : <p>Persoana nu are amenzi înregistrate.</p>}
                            <button className="print-btn" onClick={handlePrint}>🖨️ Printează Dosar</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatisticiPage;