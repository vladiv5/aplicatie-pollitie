/** Componenta complexa de raportare si analiza statistica
 * Include grafice (Recharts), filtre temporale si generare de dosare tiparibile
 * @author Ivan Vlad-Daniel
 * @version 11 ianuarie 2026
 */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LiveSearchInput from '../components/LiveSearchInput';
import PaginatedCard from '../components/PaginatedCard';
import '../components/styles/Statistici.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import toast from 'react-hot-toast';

// Culorile folosite in grafice (tema Navy/Gold/Red)
const COLORS = ['#0a2647', '#bfa05d', '#dc3545', '#28a745', '#6c757d', '#144272'];

// Helper pentru formatarea datei in format romanesc
const formatDateDisplay = (isoDate) => {
    if (!isoDate) return '-';
    const datePart = isoDate.toString().split('T')[0];
    const parts = datePart.split('-');
    if (parts.length !== 3) return isoDate;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

// Randare personalizata pentru etichetele procentuale de pe Pie Chart
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: '14px', fontWeight: 'bold', textShadow: '0px 1px 3px rgba(0,0,0,0.8)', pointerEvents: 'none' }}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

// Componenta personalizata pentru Tooltip-ul graficelor (afiseaza detalii la hover)
const CustomChartTooltip = ({ active, payload, label, type }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="st-custom-tooltip-box">
                <div className="st-tooltip-header">
                    {data.nume ? `${data.nume} ${data.prenume || ''}` : (data.grad || label)}
                </div>

                {/* Afisez continut diferit in functie de tipul graficului */}
                {type === 'politist' && (
                    <div className="st-tooltip-body">
                        <div>Funcție: {data.functie}</div>
                        <div>Grad: {data.grad}</div>
                        <div className="st-tooltip-value">Total: {data.total_valoare} RON</div>
                    </div>
                )}
                {type === 'persoana' && (
                    <div className="st-tooltip-body">
                        <div>CNP: {data.cnp}</div>
                        <div className="st-tooltip-alert">Datorie: {data.datorie_totala} RON</div>
                    </div>
                )}
                {type === 'strada' && (
                    <div className="st-tooltip-body">
                        <div className="st-tooltip-info">Incidente: {data.nr_incidente}</div>
                    </div>
                )}
                {type === 'standard' && (
                    <div className="st-tooltip-body">
                        <div className="st-tooltip-info">Grad: {data.grad}</div>
                        <div className="st-tooltip-value">Valoare: {data.valoare_totala} RON</div>
                    </div>
                )}
            </div>
        );
    }
    return null;
};

const StatisticiPage = () => {
    // --- STATE PENTRU FILTRE ---
    const [startDate, setStartDate] = useState({d: '', m: '', y: ''});
    const [endDate, setEndDate] = useState({d: '', m: '', y: ''});
    const [dateError, setDateError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [printTarget, setPrintTarget] = useState(null);

    const [activeStartDate, setActiveStartDate] = useState(null);
    const [activeEndDate, setActiveEndDate] = useState(null);

    // --- STATE PENTRU DATE (API) ---
    const [topPolitisti, setTopPolitisti] = useState([]);
    const [amenziGrad, setAmenziGrad] = useState([]);
    const [topStrazi, setTopStrazi] = useState([]);
    const [rauPlatnici, setRauPlatnici] = useState([]);
    const [zoneSigure, setZoneSigure] = useState([]);
    const [agentiSeveri, setAgentiSeveri] = useState([]);
    const [recidivisti, setRecidivisti] = useState([]);
    const [zileCritice, setZileCritice] = useState([]);

    // --- STATE PENTRU DOSARE OPERATIVE ---
    const [currentSlide, setCurrentSlide] = useState(0);
    const [selectedPolitist, setSelectedPolitist] = useState(null);
    const [rezultatPolitist, setRezultatPolitist] = useState(null);
    const [selectedPersoana, setSelectedPersoana] = useState(null);
    const [rezultatCnp, setRezultatCnp] = useState(null);

    // Functia care incarca toate datele cand se aplica filtrele
    const fetchAllData = () => {
        const token = localStorage.getItem('token');
        const config = {
            headers: {'Authorization': `Bearer ${token}`},
            params: {start: activeStartDate, end: activeEndDate}
        };
        setDateError('');

        // Fac cereri paralele catre endpoint-urile de statistica
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

    // Gestionez input-ul manual pentru data (doar cifre)
    const handleDateChange = (type, field, value) => {
        if (value && !/^\d+$/.test(value)) return;
        if ((field === 'd' || field === 'm') && value.length > 2) return;
        if (field === 'y' && value.length > 4) return;
        if (type === 'start') setStartDate(prev => ({...prev, [field]: value}));
        else setEndDate(prev => ({...prev, [field]: value}));
        if (successMsg) setSuccessMsg('');
    };

    // Construiesc string-ul de data pentru backend (YYYY-MM-DD)
    const buildDateString = (d, m, y) => {
        if (!d && !m && !y) return null;
        if (!d || !m || !y) return 'INVALID';
        const day = parseInt(d, 10);
        const month = parseInt(m, 10);
        const year = parseInt(y, 10);
        if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) return 'INVALID';
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    // Aplic filtrele si validez logica temporala
    const handleApplyFilters = () => {
        setSuccessMsg('');
        const startStr = buildDateString(startDate.d, startDate.m, startDate.y);
        const endStr = buildDateString(endDate.d, endDate.m, endDate.y);

        if (startStr === 'INVALID' || endStr === 'INVALID') {
            setDateError('Data invalidă.');
            return;
        }
        if (startStr && endStr && startStr > endStr) {
            setDateError('Data start > Data sfârșit.');
            return;
        }

        setActiveStartDate(startStr);
        setActiveEndDate(endStr);
        setDateError('');
        if (startStr || endStr) setSuccessMsg("Filtre aplicate!");

        // Daca am selectat deja un politist/persoana, reincarc datele lor cu noile filtre
        if (selectedPolitist) handleCautaPolitist(startStr, endStr);
        if (selectedPersoana) handleCautaCnp(startStr, endStr);
    };

    const handleReset = () => {
        setStartDate({d: '', m: '', y: ''});
        setEndDate({d: '', m: '', y: ''});
        setActiveStartDate(null);
        setActiveEndDate(null);
        setDateError('');
        setSuccessMsg('');
        setRezultatPolitist(null);
        setRezultatCnp(null);
    };

    // Cautare dosar Politist
    const handleCautaPolitist = (start = activeStartDate, end = activeEndDate) => {
        if (!selectedPolitist) return;
        const token = localStorage.getItem('token');
        const config = {
            headers: {'Authorization': `Bearer ${token}`},
            params: {id: selectedPolitist.idPolitist, start, end}
        };
        axios.get(`http://localhost:8080/api/statistici/incidente-politist`, config)
            .then(res => setRezultatPolitist(res.data))
            .catch(() => toast.error("Fără date."));
    };

    // Cautare dosar Cetatean (Cazier)
    const handleCautaCnp = (start = activeStartDate, end = activeEndDate) => {
        if (!selectedPersoana) return;
        const token = localStorage.getItem('token');
        const config = {headers: {'Authorization': `Bearer ${token}`}, params: {cnp: selectedPersoana.cnp, start, end}};
        axios.get(`http://localhost:8080/api/statistici/istoric-cnp`, config)
            .then(res => setRezultatCnp(res.data))
            .catch(() => toast.error("Fără date."));
    };

    // Logica de printare: Activez clasa CSS specifica si apoi deschid dialogul
    const handlePrint = (target) => {
        setPrintTarget(target);
        setTimeout(() => {
            window.print();
            setPrintTarget(null);
        }, 500);
    };

    // --- DEFINITIA GRAFICELOR DIN CARUSEL ---
    const slides = [
        {
            id: 0,
            title: "Top Polițiști (Valoare Amenzi)",
            icon: "fa-solid fa-trophy",
            component: (
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={topPolitisti.slice(0, 20)} margin={{top: 20, right: 30, left: 20, bottom: 70}}>
                        <defs>
                            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#d4af37" stopOpacity={0.9}/>
                                <stop offset="95%" stopColor="#d4af37" stopOpacity={0.2}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)"/>
                        <XAxis
                            dataKey={(row) => `${row.nume} ${row.prenume}`}
                            tick={{fontSize: 11, fill: '#cbd5e1'}}
                            angle={-45}
                            textAnchor="end"
                            interval={0}
                            tickLine={false}
                            axisLine={{stroke: '#475569'}}
                        />
                        <YAxis tick={{fill: '#cbd5e1'}} tickLine={false} axisLine={false}/>
                        <Tooltip content={<CustomChartTooltip type="politist"/>} cursor={{fill: 'rgba(255,255,255,0.05)'}}/>
                        <Bar dataKey="total_valoare" fill="url(#goldGradient)" name="Total RON" barSize={30} radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 1,
            title: "Distribuție Amenzi pe Grade",
            icon: "fa-solid fa-chart-pie",
            component: (
                <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                        <Pie
                            data={amenziGrad}
                            cx="50%" cy="50%"
                            innerRadius={80}
                            outerRadius={120}
                            paddingAngle={5}
                            dataKey="valoare_totala"
                            nameKey="grad"
                            stroke="none"
                            label={renderCustomizedLabel}
                            labelLine={false}
                        >
                            {amenziGrad.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                            ))}
                        </Pie>
                        <Tooltip content={<CustomChartTooltip type="standard"/>}/>
                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{color: '#cbd5e1', paddingTop: '20px'}} />
                    </PieChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 2,
            title: "Top Zone de Risc (Străzi)",
            icon: "fa-solid fa-fire",
            component: (
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={topStrazi.slice(0, 20)} margin={{top: 20, right: 30, left: 20, bottom: 100}}>
                        <defs>
                            <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#dc3545" stopOpacity={0.9}/>
                                <stop offset="95%" stopColor="#dc3545" stopOpacity={0.2}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)"/>
                        <XAxis
                            dataKey="strada"
                            tick={{fontSize: 11, fill: '#cbd5e1'}}
                            angle={-45}
                            textAnchor="end"
                            interval={0}
                            tickLine={false}
                            axisLine={{stroke: '#475569'}}
                        />
                        <YAxis tick={{fill: '#cbd5e1'}} tickLine={false} axisLine={false}/>
                        <Tooltip content={<CustomChartTooltip type="strada"/>} cursor={{fill: 'rgba(255,255,255,0.05)'}}/>
                        <Bar dataKey="nr_incidente" fill="url(#redGradient)" name="Incidente" barSize={30} radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 3,
            title: "Top Rău-Platnici",
            icon: "fa-solid fa-triangle-exclamation",
            component: (
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={rauPlatnici.slice(0, 20)} margin={{top: 20, right: 30, left: 20, bottom: 70}}>
                        <defs>
                            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)"/>
                        <XAxis
                            dataKey={(row) => `${row.nume} ${row.prenume}`}
                            tick={{fontSize: 11, fill: '#cbd5e1'}}
                            angle={-30}
                            textAnchor="end"
                            interval={0}
                            tickLine={false}
                            axisLine={{stroke: '#475569'}}
                        />
                        <YAxis tick={{fill: '#cbd5e1'}} tickLine={false} axisLine={false}/>
                        <Tooltip content={<CustomChartTooltip type="persoana"/>} cursor={{fill: 'rgba(255,255,255,0.05)'}}/>
                        <Bar dataKey="datorie_totala" fill="url(#blueGradient)" name="Datorie (RON)" barSize={30} radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            )
        }
    ];

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    return (
        <div className="page-container st-stats-container">
            <h2 className="st-page-title">Dashboard Analitic</h2>

            {/* --- ZONA FILTRE --- */}
            <div className="st-command-bar">
                <div className="st-filter-container">
                    <div className="st-filter-group">
                        <div className="st-filter-label">Data Start</div>
                        <div className="st-date-group">
                            <input className="st-date-part st-w-day" placeholder="ZZ" value={startDate.d} onChange={(e) => handleDateChange('start', 'd', e.target.value)}/>
                            <span className="st-date-sep">/</span>
                            <input className="st-date-part st-w-month" placeholder="LL" value={startDate.m} onChange={(e) => handleDateChange('start', 'm', e.target.value)}/>
                            <span className="st-date-sep">/</span>
                            <input className="st-date-part st-w-year" placeholder="AAAA" value={startDate.y} onChange={(e) => handleDateChange('start', 'y', e.target.value)}/>
                        </div>
                    </div>

                    <span className="st-arrow-separator">➜</span>

                    <div className="st-filter-group">
                        <div className="st-filter-label">Data Sfârșit</div>
                        <div className="st-date-group">
                            <input className="st-date-part st-w-day" placeholder="ZZ" value={endDate.d} onChange={(e) => handleDateChange('end', 'd', e.target.value)}/>
                            <span className="st-date-sep">/</span>
                            <input className="st-date-part st-w-month" placeholder="LL" value={endDate.m} onChange={(e) => handleDateChange('end', 'm', e.target.value)}/>
                            <span className="st-date-sep">/</span>
                            <input className="st-date-part st-w-year" placeholder="AAAA" value={endDate.y} onChange={(e) => handleDateChange('end', 'y', e.target.value)}/>
                        </div>
                    </div>
                </div>

                <div className="st-action-buttons">
                    <button className="st-apply-btn" onClick={handleApplyFilters}><i className="fa-solid fa-check"></i> APLICĂ</button>
                    <button className="st-reset-btn" onClick={handleReset}><i className="fa-solid fa-rotate-left"></i> RESET</button>
                </div>
            </div>

            {/* --- MESAJE STARE --- */}
            <div className={`st-message-panel ${dateError ? 'st-msg-error' : ''} ${!dateError && successMsg ? 'st-msg-success' : ''} ${!dateError && !successMsg ? 'st-hidden' : ''}`}>
                {dateError && (
                    <div className="st-msg-content">
                        <div className="st-msg-icon-box"><i className="fa-solid fa-circle-exclamation"></i></div>
                        <div className="st-msg-text"><strong>Atenție!</strong><span>{dateError}</span></div>
                    </div>
                )}
                {!dateError && successMsg && (
                    <div className="st-msg-content">
                        <div className="st-msg-icon-box"><i className="fa-solid fa-circle-check"></i></div>
                        <div className="st-msg-text"><strong>Succes!</strong><span>{successMsg}</span></div>
                    </div>
                )}
            </div>

            {/* --- CAROUSEL GRAFICE --- */}
            <div className="st-carousel-container">
                <div className="st-carousel-content" key={currentSlide}>
                    <h3 className="st-slide-title"><i className={slides[currentSlide].icon}></i>{slides[currentSlide].title}</h3>
                    {slides[currentSlide].component}
                </div>
                <div className="st-carousel-controls">
                    <button className="st-nav-arrow" onClick={prevSlide}><i className="fa-solid fa-chevron-left"></i></button>
                    <button className="st-nav-arrow" onClick={nextSlide}><i className="fa-solid fa-chevron-right"></i></button>
                </div>
                <div className="st-slide-indicator">
                    {slides.map((_, idx) => (
                        <div key={idx} className={`st-dot ${currentSlide === idx ? 'st-active' : ''}`} onClick={() => setCurrentSlide(idx)}></div>
                    ))}
                </div>
            </div>

            {/* --- GRID CARDURI PAGINATE --- */}
            <div className="st-analysis-grid">
                <PaginatedCard
                    title="Zone Sigure"
                    icon={<i className="fa-solid fa-shield-halved st-card-fa-icon"></i>}
                    colorClass="st-card-green"
                    data={zoneSigure}
                    itemsPerPage={5}
                    description="Străzi fără niciun incident înregistrat în perioada selectată."
                    renderItem={(item, idx) => (
                        <tr key={idx} className="st-tooltip-trigger" data-tooltip={`Locație Sigură\nStrada: ${item.strada}\nLocalitate: ${item.localitate}`}>
                            <td>
                                <div className="st-tooltip-wrapper">
                                    <span className="st-main-text">{item.strada}</span>
                                    <span className="st-sub-text">{item.localitate}</span>
                                </div>
                            </td>
                            <td>0 INCIDENTE</td>
                        </tr>
                    )}
                />

                <PaginatedCard
                    title="Agenți Severi"
                    icon={<i className="fa-solid fa-user-secret st-card-fa-icon"></i>}
                    colorClass="st-card-orange"
                    data={agentiSeveri}
                    itemsPerPage={5}
                    description="Polițiști cu media valorică a amenzilor peste media globală."
                    renderItem={(item, idx) => (
                        <tr key={idx} className="st-tooltip-trigger" data-tooltip={`Detalii Agent\nGrad: ${item.grad}\nFuncție: ${item.functie}\nMedie amenzi: ${parseFloat(item.medie_personala).toFixed(0)} RON`}>
                            <td>
                                <div className="st-tooltip-wrapper">
                                    <span className="st-main-text">{item.nume} {item.prenume}</span>
                                    <span className="st-sub-text">{item.grad}</span>
                                </div>
                            </td>
                            <td>{parseFloat(item.medie_personala).toFixed(0)} RON</td>
                        </tr>
                    )}
                />

                <PaginatedCard
                    title="Recidiviști"
                    icon={<i className="fa-solid fa-triangle-exclamation st-card-fa-icon"></i>}
                    colorClass="st-card-red"
                    data={recidivisti}
                    itemsPerPage={5}
                    description="Persoane cu un număr de abateri peste media populației."
                    renderItem={(item, idx) => (
                        <tr key={idx} className="st-tooltip-trigger" data-tooltip={`Date Personale\nCNP: ${item.cnp}\nTotal Abateri: ${item.nr_abateri}`}>
                            <td>
                                <div className="st-tooltip-wrapper">
                                    <span className="st-main-text">{item.nume} {item.prenume}</span>
                                    <span className="st-sub-text">{item.cnp}</span>
                                </div>
                            </td>
                            <td>{item.nr_abateri} abateri</td>
                        </tr>
                    )}
                />

                <PaginatedCard
                    title="Zile Critice"
                    icon={<i className="fa-solid fa-calendar-days st-card-fa-icon"></i>}
                    colorClass="st-card-blue"
                    data={zileCritice}
                    itemsPerPage={5}
                    description="Zile cu un volum de incidente peste media zilnică obișnuită."
                    renderItem={(item, idx) => (
                        <tr key={idx} className="st-tooltip-trigger" data-tooltip={`Raport Zilnic\nData: ${formatDateDisplay(item.ziua)}\nVolum Incidente: ${item.nr_incidente}`}>
                            <td>
                                <div className="st-tooltip-wrapper">
                                    <span className="st-main-text">{formatDateDisplay(item.ziua)}</span>
                                </div>
                            </td>
                            <td>{item.nr_incidente} incidente</td>
                        </tr>
                    )}
                />
            </div>

            {/* --- ARHIVĂ DOSARE --- */}
            <h2 className="st-page-title" style={{marginTop: '60px'}}>Arhivă Operativă</h2>

            <div className="st-dashboard-grid">
                {/* --- COLOANA 1: POLIȚIST --- */}
                <div className="st-archive-column">
                    <div className="st-search-wrapper">
                        <div className="st-search-input-container">
                            <LiveSearchInput
                                label="Căutare Polițist"
                                placeholder="Nume..."
                                apiUrl="http://localhost:8080/api/politisti/cauta"
                                displayKey={(p) => `${p.nume} ${p.prenume} (${p.grad})`}
                                onSelect={(item) => {
                                    setSelectedPolitist(item);
                                    setRezultatPolitist(null);
                                }}
                            />
                        </div>
                        <button className="st-search-btn-modern" onClick={() => handleCautaPolitist()}>
                            <i className="fa-solid fa-folder-open"></i> DOSAR
                        </button>
                    </div>

                    {rezultatPolitist && selectedPolitist && (
                        <div className={`st-dossier-card ${printTarget === 'politist' ? 'printing-active' : ''}`}>
                            <div className="st-dossier-top-bar"></div>
                            <div className="st-stamp">CONFIDENȚIAL</div>

                            <div className="st-dossier-header">
                                <div className="st-dossier-photo-placeholder"><i className="fa-solid fa-user-shield"></i></div>
                                <div className="st-dossier-info">
                                    <h2>{selectedPolitist.nume} {selectedPolitist.prenume}</h2>
                                    <div className="st-dossier-detail"><b>GRAD:</b> {selectedPolitist.grad}</div>
                                    <div className="st-dossier-detail"><b>FUNCȚIE:</b> {selectedPolitist.functie}</div>
                                </div>
                            </div>

                            <h4 style={{borderBottom: '1px solid #333', marginBottom: '10px'}}>ACTIVITATE INCIDENTE</h4>
                            {rezultatPolitist.length > 0 ? (
                                <table className="st-dossier-table">
                                    <thead><tr><th>Dată</th><th>Tip</th><th>Locație</th></tr></thead>
                                    <tbody>
                                    {rezultatPolitist.map((r, i) => (
                                        <tr key={i}>
                                            <td>{formatDateDisplay(r.data_emitere)}</td>
                                            <td>{r.tip_incident}</td>
                                            <td>{r.descriere_locatie}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            ) : <p>Fără activitate.</p>}

                            <button className="st-print-btn" onClick={() => handlePrint('politist')}>
                                <i className="fa-solid fa-print"></i> Printează Dosar
                            </button>
                        </div>
                    )}
                </div>

                {/* --- COLOANA 2: CETĂȚEAN --- */}
                <div className="st-archive-column">
                    <div className="st-search-wrapper">
                        <div className="st-search-input-container">
                            <LiveSearchInput
                                label="Căutare Cetățean"
                                placeholder="Nume/CNP..."
                                apiUrl="http://localhost:8080/api/persoane/cauta"
                                displayKey={(p) => `${p.nume} ${p.prenume} (${p.cnp})`}
                                onSelect={(item) => {
                                    setSelectedPersoana(item);
                                    setRezultatCnp(null);
                                }}
                            />
                        </div>
                        <button className="st-search-btn-modern" onClick={() => handleCautaCnp()}>
                            <i className="fa-solid fa-folder-open"></i> DOSAR
                        </button>
                    </div>

                    {rezultatCnp && selectedPersoana && (
                        <div className={`st-dossier-card ${printTarget === 'cetatean' ? 'printing-active' : ''}`}>
                            <div className="st-dossier-top-bar"></div>
                            <div className="st-stamp">CAZIER</div>

                            <div className="st-dossier-header">
                                <div className="st-dossier-photo-placeholder"><i className="fa-solid fa-user"></i></div>
                                <div className="st-dossier-info">
                                    <h2>{selectedPersoana.nume} {selectedPersoana.prenume}</h2>
                                    <div className="st-dossier-detail"><b>CNP:</b> {selectedPersoana.cnp}</div>
                                    <div className="st-dossier-detail"><b>TEL:</b> {selectedPersoana.telefon}</div>
                                </div>
                            </div>

                            <h4 style={{borderBottom: '1px solid #333', marginBottom: '10px'}}>ISTORIC SANCȚIUNI</h4>
                            {rezultatCnp.length > 0 ? (
                                <table className="st-dossier-table">
                                    <thead><tr><th>Dată</th><th>Motiv</th><th>Sumă</th></tr></thead>
                                    <tbody>
                                    {rezultatCnp.map((r, i) => (
                                        <tr key={i}>
                                            <td>{formatDateDisplay(r.data_emitere)}</td>
                                            <td>{r.motiv}</td>
                                            <td>{r.suma} RON</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            ) : <p>Curat.</p>}

                            <button className="st-print-btn" onClick={() => handlePrint('cetatean')}>
                                <i className="fa-solid fa-print"></i> Printează Dosar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatisticiPage;