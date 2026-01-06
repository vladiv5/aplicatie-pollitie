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
        const data = payload[0].payload;

        return (
            <div className="st-custom-tooltip-box" style={{visibility:'visible', opacity:1, pointerEvents:'none'}}>
                <div style={{fontWeight:'bold', borderBottom:'1px solid rgba(255,255,255,0.2)', marginBottom:'5px', paddingBottom:'3px'}}>
                    {data.nume ? `${data.nume} ${data.prenume || ''}` : label}
                </div>

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
    // --- STATE PENTRU DATA SEPARATA (ZI / LUNA / AN) ---
    const [startDate, setStartDate] = useState({ d: '', m: '', y: '' });
    const [endDate, setEndDate] = useState({ d: '', m: '', y: '' });

    const [dateError, setDateError] = useState('');

    // --- STATE NOU: Mesaj de succes ---
    const [successMsg, setSuccessMsg] = useState('');

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

    // --- HELPER: Schimbare Input Data ---
    const handleDateChange = (type, field, value) => {
        if (value && !/^\d+$/.test(value)) return;
        if ((field === 'd' || field === 'm') && value.length > 2) return;
        if (field === 'y' && value.length > 4) return;

        if (type === 'start') setStartDate(prev => ({ ...prev, [field]: value }));
        else setEndDate(prev => ({ ...prev, [field]: value }));

        // Resetam mesajul de succes cand utilizatorul editeaza din nou
        if(successMsg) setSuccessMsg('');
    };

    // --- HELPER: Construire String Data (YYYY-MM-DD) ---
    const buildDateString = (d, m, y) => {
        if (!d && !m && !y) return null; // Gol
        if (!d || !m || !y) return 'INVALID'; // Partial

        const day = parseInt(d, 10);
        const month = parseInt(m, 10);
        const year = parseInt(y, 10);

        if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) return 'INVALID';
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const handleApplyFilters = () => {
        setSuccessMsg(''); // Resetam mesajul inainte de validare
        const startStr = buildDateString(startDate.d, startDate.m, startDate.y);
        const endStr = buildDateString(endDate.d, endDate.m, endDate.y);

        if (startStr === 'INVALID' || endStr === 'INVALID') {
            setDateError('Data introdusă este invalidă sau incompletă.');
            return;
        }
        if (startStr && endStr && startStr > endStr) {
            setDateError('Data de început trebuie să fie înainte de data de sfârșit.');
            return;
        }

        setActiveStartDate(startStr);
        setActiveEndDate(endStr);
        setDateError('');

        // Setam mesajul de succes
        if (startStr || endStr) {
            setSuccessMsg("Perioada de analiză selectată!");
        }

        if (selectedPolitist) handleCautaPolitist(startStr, endStr);
        if (selectedPersoana) handleCautaCnp(startStr, endStr);
    };

    const handleReset = () => {
        setStartDate({ d: '', m: '', y: '' });
        setEndDate({ d: '', m: '', y: '' });
        setActiveStartDate(null);
        setActiveEndDate(null);
        setDateError('');
        setSuccessMsg(''); // Resetam si succesul
        setRezultatPolitist(null);
        setRezultatCnp(null);
    };

    // --- DOSARE HANDLERS ---
    const handleCautaPolitist = (start = activeStartDate, end = activeEndDate) => {
        if(!selectedPolitist) return;
        const token = localStorage.getItem('token');
        const config = { headers: { 'Authorization': `Bearer ${token}` }, params: { id: selectedPolitist.idPolitist, start, end } };
        axios.get(`http://localhost:8080/api/statistici/incidente-politist`, config)
            .then(res => setRezultatPolitist(res.data))
            .catch(() => toast.error("Fără date."));
    };

    const handleCautaCnp = (start = activeStartDate, end = activeEndDate) => {
        if(!selectedPersoana) return;
        const token = localStorage.getItem('token');
        const config = { headers: { 'Authorization': `Bearer ${token}` }, params: { cnp: selectedPersoana.cnp, start, end } };
        axios.get(`http://localhost:8080/api/statistici/istoric-cnp`, config)
            .then(res => setRezultatCnp(res.data))
            .catch(() => toast.error("Fără date."));
    };

    const handlePrint = () => {
        window.print();
    };

    // --- SLIDES CHART ---
    const slides = [
        {
            id: 0, title: "🏆 Top Polițiști (Valoare Amenzi)",
            component: (
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={topPolitisti.slice(0, 20)} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey={(row) => `${row.nume} ${row.prenume}`}
                            tick={{fontSize: 11}}
                            angle={-20}
                            textAnchor="end"
                            interval={0}
                        />
                        <YAxis />
                        <Tooltip content={<CustomChartTooltip type="politist"/>} />
                        <Legend verticalAlign="top" height={36} />
                        <Bar dataKey="total_valoare" fill="#007bff" name="Total RON" barSize={30} radius={[5, 5, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 1, title: "🧩 Distribuție Amenzi pe Grade",
            component: (
                <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                        <Pie
                            data={amenziGrad}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="valoare_totala"
                            nameKey="grad"
                        >
                            {amenziGrad.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value} RON`} />
                        <Legend verticalAlign="top" height={36} />
                    </PieChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 2, title: "🔥 Top 20 Străzi (Zone de Risc)",
            component: (
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={topStrazi.slice(0, 20)} margin={{ top: 20, right: 30, left: 20, bottom: 160 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="strada"
                            tick={{fontSize: 11}}
                            angle={-45}
                            textAnchor="end"
                            interval={0}
                        />
                        <YAxis />
                        <Tooltip content={<CustomChartTooltip type="strada"/>} />
                        <Legend wrapperStyle={{ position: 'relative', bottom: '-10px' }} />
                        <Bar dataKey="nr_incidente" fill="#dc3545" name="Nr. Incidente" barSize={30} radius={[5, 5, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 3, title: "⚠️ Top Rău-Platnici",
            component: (
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={rauPlatnici.slice(0, 20)} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey={(row) => `${row.nume} ${row.prenume}`}
                            tick={{fontSize: 11}}
                            angle={-20}
                            textAnchor="end"
                            interval={0}
                        />
                        <YAxis />
                        <Tooltip content={<CustomChartTooltip type="persoana"/>} />
                        <Legend verticalAlign="top" height={36} />
                        <Bar dataKey="datorie_totala" fill="#FF8042" name="Datorie (RON)" barSize={30} radius={[5, 5, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            )
        }
    ];

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    return (
        <div className="st-stats-container">
            <h2 className="st-page-title">Dashboard Analitic & Statistici</h2>

            {/* --- ZONA FILTRE CENTRATĂ --- */}
            {/* Am scos justifyContent: 'space-between' din CSS-ul st-command-bar și am lăsat doar center */}
            <div className="st-command-bar" style={{ justifyContent: 'center' }}>

                {/* Am sters div-ul cu titlul "Perioada de Analiza" */}

                <div className="st-filter-container">

                    {/* Data Început */}
                    <div className="st-filter-group">
                        <div className="st-filter-label">Data Început</div>
                        <div className="st-date-group">
                            <input className="st-date-part st-w-day" placeholder="ZZ" value={startDate.d} onChange={(e) => handleDateChange('start', 'd', e.target.value)} />
                            <span className="st-date-sep">/</span>
                            <input className="st-date-part st-w-month" placeholder="LL" value={startDate.m} onChange={(e) => handleDateChange('start', 'm', e.target.value)} />
                            <span className="st-date-sep">/</span>
                            <input className="st-date-part st-w-year" placeholder="AAAA" value={startDate.y} onChange={(e) => handleDateChange('start', 'y', e.target.value)} />
                        </div>
                    </div>

                    <span style={{fontSize:'1.5rem', color:'#ccc', marginBottom:'5px'}}>➔</span>

                    {/* Data Sfârșit */}
                    <div className="st-filter-group">
                        <div className="st-filter-label">Data Sfârșit</div>
                        <div className="st-date-group">
                            <input className="st-date-part st-w-day" placeholder="ZZ" value={endDate.d} onChange={(e) => handleDateChange('end', 'd', e.target.value)} />
                            <span className="st-date-sep">/</span>
                            <input className="st-date-part st-w-month" placeholder="LL" value={endDate.m} onChange={(e) => handleDateChange('end', 'm', e.target.value)} />
                            <span className="st-date-sep">/</span>
                            <input className="st-date-part st-w-year" placeholder="AAAA" value={endDate.y} onChange={(e) => handleDateChange('end', 'y', e.target.value)} />
                        </div>
                    </div>

                    <div className="st-action-buttons">
                        <button className="st-apply-btn" onClick={handleApplyFilters}>Aplică</button>
                        <button className="st-reset-btn" onClick={handleReset}>Reset</button>
                    </div>
                </div>
            </div>

            <div style={{textAlign: 'center', marginBottom: '30px', minHeight:'20px'}}>
                {/* Afișează EROAREA dacă există */}
                {dateError && (
                    <span style={{color: '#dc3545', fontWeight:'bold'}}>⚠️ {dateError}</span>
                )}

                {/* Afișează MESAJ SUCCES VERDE dacă totul e ok și nu avem eroare */}
                {!dateError && successMsg && (
                    <span style={{color: '#28a745', fontWeight:'bold', fontSize: '1.1rem'}}>✅ {successMsg}</span>
                )}
            </div>

            {/* --- CAROUSEL --- */}
            <div className="st-carousel-container">
                <button className="st-nav-arrow st-nav-prev" onClick={prevSlide}>&#10094;</button>
                <div className="st-carousel-content" key={currentSlide}>
                    <h3 className="st-slide-title">{slides[currentSlide].title}</h3>
                    {slides[currentSlide].component}
                </div>
                <button className="st-nav-arrow st-nav-next" onClick={nextSlide}>&#10095;</button>
                <div className="st-slide-indicator">
                    {slides.map((_, idx) => (<div key={idx} className={`st-dot ${currentSlide === idx ? 'st-active' : ''}`} onClick={() => setCurrentSlide(idx)}></div>))}
                </div>
            </div>

            {/* --- ANALYSIS GRID (CARDURI) --- */}
            <div className="st-analysis-grid">

                {/* 1. ZONE SIGURE */}
                <PaginatedCard
                    title="Zone Sigure"
                    icon="🛡️"
                    colorClass="st-card-green"
                    data={zoneSigure}
                    itemsPerPage={5}
                    description="Analiză bazată pe frecvența incidentelor per stradă. Afișează locațiile cu cele mai puține (sau zero) evenimente negative înregistrate în baza de date."
                    renderItem={(item, idx) => (
                        <tr key={idx}>
                            <td>
                                <div className="st-tooltip-wrapper">
                                    <span className="st-main-text">{item.strada}</span>
                                    <span className="st-sub-text">{item.localitate}</span>
                                    <div className="st-card-tooltip">
                                        <strong>Adresă Completă:</strong><br/>
                                        Strada: {item.strada}<br/>
                                        Localitate: {item.localitate}
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span style={{color:'#28a745', fontSize:'0.8em', fontWeight:'bold'}}>0 INCIDENTE</span>
                            </td>
                        </tr>
                    )}
                />

                {/* 2. AGENTI SEVERI */}
                <PaginatedCard
                    title="Agenți Severi"
                    icon="👮"
                    colorClass="st-card-orange"
                    data={agentiSeveri}
                    itemsPerPage={5}
                    description="Polițiștii a căror medie a valorii amenzilor aplicate este strict mai mare decât media valorii tuturor amenzilor din secție (AVG personal > AVG global)."
                    renderItem={(item, idx) => (
                        <tr key={idx}>
                            <td>
                                <div className="st-tooltip-wrapper">
                                    <span className="st-main-text">{item.nume} {item.prenume}</span>
                                    <span className="st-sub-text">{item.grad} • {item.functie}</span>
                                    <div className="st-card-tooltip">
                                        <strong>Agent:</strong> {item.nume} {item.prenume}<br/>
                                        <strong>Grad:</strong> {item.grad}<br/>
                                        <strong>Funcție:</strong> {item.functie}
                                    </div>
                                </div>
                            </td>
                            <td>{parseFloat(item.medie_personala).toFixed(0)} RON</td>
                        </tr>
                    )}
                />

                {/* 3. RECIDIVISTI */}
                <PaginatedCard
                    title="Recidiviști"
                    icon="⚠️"
                    colorClass="st-card-red"
                    data={recidivisti}
                    itemsPerPage={5}
                    description="Persoane fizice identificate prin CNP care figurează în baza de date cu un număr ridicat de abateri (COUNT(*) > 2) în intervalul selectat."
                    renderItem={(item, idx) => (
                        <tr key={idx}>
                            <td>
                                <div className="st-tooltip-wrapper">
                                    <span className="st-main-text">{item.nume} {item.prenume}</span>
                                    <span className="st-sub-text">CNP: {item.cnp}</span>
                                    <div className="st-card-tooltip">
                                        <strong>Nume:</strong> {item.nume} {item.prenume}<br/>
                                        <strong>CNP:</strong> {item.cnp}<br/>
                                        <span style={{color:'#ff6b6b'}}>Persoană cu istoric negativ.</span>
                                    </div>
                                </div>
                            </td>
                            <td style={{color:'#dc3545'}}>{item.nr_abateri} abateri</td>
                        </tr>
                    )}
                />

                {/* 4. ZILE CRITICE */}
                <PaginatedCard
                    title="Zile Critice"
                    icon="📅"
                    colorClass="st-card-blue"
                    data={zileCritice}
                    itemsPerPage={5}
                    description="Agregare calendaristică (GROUP BY DATE) care evidențiază datele exacte cu cel mai mare volum de incidente înregistrate (Vârfuri de activitate)."
                    renderItem={(item, idx) => (
                        <tr key={idx}>
                            <td>
                                <div className="st-tooltip-wrapper">
                                    <span className="st-main-text">{formatDateDisplay(item.ziua)}</span>
                                    <span className="st-sub-text">Zi cu risc ridicat</span>
                                    <div className="st-card-tooltip">
                                        <strong>Data:</strong> {formatDateDisplay(item.ziua)}<br/>
                                        Vârf de activitate infracțională.
                                    </div>
                                </div>
                            </td>
                            <td>{item.nr_incidente} incidente</td>
                        </tr>
                    )}
                />
            </div>

            {/* --- ARHIVA OPERATIVA (DOSARE) --- */}
            <h2 className="st-page-title" style={{marginTop:'50px'}}>📂 Arhivă Operativă (Dosare)</h2>

            <div className="st-dashboard-grid">
                {/* DOSAR POLITIST */}
                <div className="st-archive-column">
                    <div className="st-search-wrapper">
                        <div className="st-search-input-container">
                            <LiveSearchInput
                                label="Căutați Polițist"
                                placeholder="Nume, Prenume..."
                                apiUrl="http://localhost:8080/api/politisti/cauta"
                                displayKey={(p) => `${p.nume} ${p.prenume} (${p.grad} - ${p.functie})`}
                                onSelect={(item) => setSelectedPolitist(item)}
                            />
                        </div>
                        <button className="st-search-btn-modern" onClick={() => handleCautaPolitist()}>
                            🔍 Deschide Dosar
                        </button>
                    </div>

                    {rezultatPolitist && selectedPolitist && (
                        <div className="st-dossier-card">
                            <div className="st-dossier-top-bar"></div>
                            <div className="st-stamp">DOSAR PERSONAL</div>
                            <div className="st-dossier-header">
                                <div className="st-dossier-photo-placeholder">FOTO</div>
                                <div className="st-dossier-info" style={{flex:1, marginLeft:'20px'}}>
                                    <h2>{selectedPolitist.nume} {selectedPolitist.prenume}</h2>
                                    <div className="st-dossier-detail"><b>Grad:</b> {selectedPolitist.grad}</div>
                                    <div className="st-dossier-detail"><b>Funcție:</b> {selectedPolitist.functie}</div>
                                    <div className="st-dossier-detail"><b>Telefon:</b> {selectedPolitist.telefon_serviciu}</div>
                                    <div className="st-dossier-detail"><b>ID Serviciu:</b> {selectedPolitist.idPolitist}</div>
                                </div>
                            </div>
                            <h4 style={{borderBottom:'1px solid #333'}}>RAPORT DE ACTIVITATE (INCIDENTE GESTIONATE)</h4>
                            {rezultatPolitist.length > 0 ? (
                                <table className="st-dossier-table">
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
                            <button className="st-print-btn" onClick={handlePrint}>🖨️ Printează Dosar</button>
                        </div>
                    )}
                </div>

                {/* DOSAR CETATEAN */}
                <div className="st-archive-column">
                    <div className="st-search-wrapper">
                        <div className="st-search-input-container">
                            <LiveSearchInput
                                label="Căutați Cetățean"
                                placeholder="Nume sau CNP..."
                                apiUrl="http://localhost:8080/api/persoane/cauta"
                                displayKey={(p) => `${p.nume} ${p.prenume} (CNP: ${p.cnp})`}
                                onSelect={(item) => setSelectedPersoana(item)}
                            />
                        </div>
                        <button className="st-search-btn-modern" onClick={() => handleCautaCnp()}>
                            🔍 Deschide Dosar
                        </button>
                    </div>

                    {rezultatCnp && selectedPersoana && (
                        <div className="st-dossier-card">
                            <div className="st-dossier-top-bar"></div>
                            <div className="st-stamp">CAZIER FISCAL</div>
                            <div className="st-dossier-header">
                                <div className="st-dossier-photo-placeholder">FOTO</div>
                                <div className="st-dossier-info" style={{flex:1, marginLeft:'20px'}}>
                                    <h2>{selectedPersoana.nume} {selectedPersoana.prenume}</h2>
                                    <div className="st-dossier-detail"><b>CNP:</b> {selectedPersoana.cnp}</div>
                                    <div className="st-dossier-detail"><b>Telefon:</b> {selectedPersoana.telefon}</div>
                                    <div className="st-dossier-detail"><b>Data Nașterii:</b> {formatDateDisplay(selectedPersoana.dataNasterii)}</div>
                                </div>
                            </div>
                            <h4 style={{borderBottom:'1px solid #333'}}>ISTORIC AMENZI & SANCȚIUNI</h4>
                            {rezultatCnp.length > 0 ? (
                                <table className="st-dossier-table">
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
                            <button className="st-print-btn" onClick={handlePrint}>🖨️ Printează Dosar</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatisticiPage;