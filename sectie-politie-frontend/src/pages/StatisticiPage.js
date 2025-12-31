import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LiveSearchInput from '../components/LiveSearchInput';
import '../components/styles/TableStyles.css';
import '../components/styles/Statistici.css';

// Importăm graficele din Recharts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560'];

// ... (Păstrezi funcțiile parseUserDate, formatDateDisplay, SplitDateInput neschimbate) ...
// --- COPIAZA DE MAI SUS ACELE FUNCȚII DACĂ LE-AI ȘTERS ---
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
    const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return isoDate;
};
const formatDateDisplay = (isoDate) => {
    if (!isoDate) return '';
    const parts = isoDate.split('-');
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
};

const StatisticiPage = () => {
    // ... (Păstrezi toate state-urile pentru filtre și grafice neschimbate) ...
    const [startInput, setStartInput] = useState('');
    const [endInput, setEndInput] = useState('');
    const [dateError, setDateError] = useState('');
    const [activeStartDate, setActiveStartDate] = useState(null);
    const [activeEndDate, setActiveEndDate] = useState(null);

    const [topPolitisti, setTopPolitisti] = useState([]);
    const [amenziGrad, setAmenziGrad] = useState([]);
    const [topStrazi, setTopStrazi] = useState([]);
    const [rauPlatnici, setRauPlatnici] = useState([]);
    const [zoneSigure, setZoneSigure] = useState([]);
    const [agentiSeveri, setAgentiSeveri] = useState([]);
    const [recidivisti, setRecidivisti] = useState([]);
    const [zileCritice, setZileCritice] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);

    // --- STATE INTERACTIVE MODIFICAT (Obiecte complete) ---
    const [selectedPolitist, setSelectedPolitist] = useState(null); // Obiect întreg
    const [rezultatPolitist, setRezultatPolitist] = useState(null);

    const [selectedPersoana, setSelectedPersoana] = useState(null); // Obiect întreg
    const [rezultatCnp, setRezultatCnp] = useState(null);

    // ... (Păstrezi fetchAllData, useEffect, handleApplyFilters, handleReset, slides, carousel logic - EXACT CA ÎNAINTE) ...

    // REIA LOGICA DE FETCH DATA SI CAROUSEL DIN CODUL ANTERIOR (Nu o mai scriu aici ca să nu fie mesajul kilometric)
    // Asigură-te că le ai în fișier!
    const fetchAllData = () => {
        const token = localStorage.getItem('token');
        const config = {
            headers: { 'Authorization': `Bearer ${token}` },
            params: { start: activeStartDate, end: activeEndDate }
        };

        // Resetăm erorile vizuale vechi
        setDateError('');

        axios.get('http://localhost:8080/api/statistici/top-politisti', config).then(res => setTopPolitisti(res.data));
        axios.get('http://localhost:8080/api/statistici/amenzi-grad', config).then(res => setAmenziGrad(res.data));
        axios.get('http://localhost:8080/api/statistici/top-strazi', config).then(res => setTopStrazi(res.data));
        axios.get('http://localhost:8080/api/statistici/rau-platnici', config).then(res => setRauPlatnici(res.data));

        axios.get('http://localhost:8080/api/statistici/zone-sigure', config).then(res => setZoneSigure(res.data));
        axios.get('http://localhost:8080/api/statistici/agenti-severi', config).then(res => setAgentiSeveri(res.data));
        axios.get('http://localhost:8080/api/statistici/recidivisti', config).then(res => setRecidivisti(res.data));
        axios.get('http://localhost:8080/api/statistici/zile-critice', config).then(res => setZileCritice(res.data));

        setRezultatPolitist(null);
        setRezultatCnp(null);
    };

    // Trigger fetch doar când filtrele active se schimbă (la apăsarea butonului)
    useEffect(() => {
        fetchAllData();
    }, [activeStartDate, activeEndDate]);

    // --- HANDLER BUTON "APLICĂ FILTRE" ---
    const handleApplyFilters = () => {
        // 1. Parsăm inputurile
        const parsedStart = parseUserDate(startInput);
        const parsedEnd = parseUserDate(endInput);

        // 2. Verificăm validitatea
        if (parsedStart === 'INVALID' || parsedEnd === 'INVALID') {
            setDateError('Format dată invalid! Folosește formatul: ZZ.LL.AAAA (ex: 01.01.2025)');
            return;
        }

        // 3. Verificăm logica (Start să nu fie după End)
        if (parsedStart && parsedEnd && parsedStart > parsedEnd) {
            setDateError('Data de început nu poate fi după data de sfârșit!');
            return;
        }

        // 4. Dacă totul e ok, setăm filtrele active (ceea ce declanșează useEffect -> Fetch)
        setActiveStartDate(parsedStart);
        setActiveEndDate(parsedEnd);
        setDateError(''); // Ștergem erorile
    };

    const handleReset = () => {
        setStartInput('');
        setEndInput('');
        setActiveStartDate(null);
        setActiveEndDate(null);
        setDateError('');
    };

    // --- CAROUSEL LOGIC ---
    const slides = [
        {
            id: 0, title: "🏆 Top Polițiști (Valoare Amenzi)",
            component: (
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={topPolitisti} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="nume" tick={{fontSize: 12}} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="total_valoare" fill="#007bff" name="Total RON" barSize={50} />
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
            id: 2, title: "🔥 Top Străzi (Zone de Risc)",
            component: (
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={topStrazi} layout="vertical" margin={{ top: 20, right: 30, left: 50, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="strada" type="category" width={100} tick={{fontSize: 11}} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="nr_incidente" fill="#dc3545" name="Nr. Incidente" barSize={30} />
                    </BarChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 3, title: "⚠️ Top Rău-Platnici (Datorii)",
            component: (
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={rauPlatnici} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="nume" tick={{fontSize: 12}} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="datorie_totala" fill="#FF8042" name="Datorie (RON)" barSize={50} />
                    </BarChart>
                </ResponsiveContainer>
            )
        }
    ];

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    // --- SEARCH HANDLERS UPDATE ---
    const handleCautaPolitist = () => {
        if(!selectedPolitist) return;
        const token = localStorage.getItem('token');
        const config = { headers: { 'Authorization': `Bearer ${token}` }, params: { id: selectedPolitist.idPolitist, start: activeStartDate, end: activeEndDate } };
        axios.get(`http://localhost:8080/api/statistici/incidente-politist`, config)
            .then(res => setRezultatPolitist(res.data))
            .catch(() => alert("Fără date."));
    };

    const handleCautaCnp = () => {
        if(!selectedPersoana) return;
        const token = localStorage.getItem('token');
        const config = { headers: { 'Authorization': `Bearer ${token}` }, params: { cnp: selectedPersoana.cnp, start: activeStartDate, end: activeEndDate } };
        axios.get(`http://localhost:8080/api/statistici/istoric-cnp`, config)
            .then(res => setRezultatCnp(res.data))
            .catch(() => alert("Fără date."));
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="stats-container">
            <h2 className="page-title">Dashboard Analitic & Statistici</h2>

            {/* COMMAND BAR */}
            <div className="command-bar">
                <div className="filter-container">
                    <div className="filter-group">
                        <label>Data Început:</label>
                        <input type="text" className="date-input-text" placeholder="ex: 01.01.2024" value={startInput} onChange={(e) => setStartInput(e.target.value)} />
                    </div>
                    <div className="filter-group">
                        <label>Data Sfârșit:</label>
                        <input type="text" className="date-input-text" placeholder="ex: 31.12.2024" value={endInput} onChange={(e) => setEndInput(e.target.value)} />
                    </div>
                    <button className="apply-btn" onClick={handleApplyFilters}>🔍 Aplică Filtre</button>
                    <button className="reset-btn" onClick={handleReset}>↺ Reset</button>
                </div>
            </div>

            <div style={{textAlign: 'center', marginBottom: '30px', minHeight:'20px'}}>
                {dateError ? (<span style={{color: '#dc3545', fontWeight:'bold'}}>⚠️ {dateError}</span>) :
                    (<span style={{color: '#666', fontStyle: 'italic'}}>{activeStartDate && activeEndDate ? `📊 Analiză activă: ${formatDateDisplay(activeStartDate)} ➔ ${formatDateDisplay(activeEndDate)}` : "📊 Se afișează istoricul complet (All Time)"}</span>)}
            </div>

            {/* CAROUSEL - Păstrat neschimbat */}
            <div className="carousel-container">
                <button className="nav-arrow nav-prev" onClick={prevSlide}>&#10094;</button>
                <div className="carousel-content" key={currentSlide}>
                    <h3 className="slide-title">{slides[currentSlide].title}</h3>
                    {slides[currentSlide].component}
                </div>
                <button className="nav-arrow nav-next" onClick={nextSlide}>&#10095;</button>
                <div className="slide-indicator">{slides.map((_, idx) => (<div key={idx} className={`dot ${currentSlide === idx ? 'active' : ''}`} onClick={() => setCurrentSlide(idx)}></div>))}</div>
            </div>

            {/* ANALIZĂ COMPLEXĂ - Păstrat neschimbat */}
            <div className="analysis-grid">
                <div className="analysis-card card-green">
                    <h3>🛡️ Zone Sigure (0 Incidente)</h3>
                    {zoneSigure.length > 0 ? (
                        <table className="mini-table"><tbody>{zoneSigure.slice(0, 5).map((z, idx) => (<tr key={idx}><td>{z.strada}, {z.localitate}</td></tr>))}</tbody></table>
                    ) : <p style={{color:'#666'}}>Nicio zonă sigură.</p>}
                </div>
                <div className="analysis-card card-orange">
                    <h3>👮 Agenți Severi (Peste Medie)</h3>
                    <table className="mini-table"><tbody>{agentiSeveri.map((a, idx) => (<tr key={idx}><td>{a.nume}</td><td style={{fontWeight:'bold'}}>{parseFloat(a.medie_personala).toFixed(0)}</td></tr>))}</tbody></table>
                </div>
                <div className="analysis-card card-red">
                    <h3>⚠️ Recidiviști (Frecvență)</h3>
                    <table className="mini-table"><tbody>{recidivisti.map((r, idx) => (<tr key={idx}><td>{r.nume}</td><td style={{color:'red', fontWeight:'bold'}}>{r.nr_abateri}</td></tr>))}</tbody></table>
                </div>
                <div className="analysis-card card-blue">
                    <h3>📅 Zile Critice</h3>
                    <table className="mini-table"><tbody>{zileCritice.map((z, idx) => (<tr key={idx}><td>{z.ziua}</td><td style={{fontWeight:'bold'}}>{z.nr_incidente}</td></tr>))}</tbody></table>
                </div>
            </div>

            {/* --- SECTIUNEA DE SEARCH MODERNIZATĂ (DOSARE) --- */}
            <h2 className="page-title" style={{marginTop:'50px'}}>📂 Arhivă Operativă (Dosare)</h2>

            <div className="dashboard-grid">

                {/* 1. DOSAR POLIȚIST */}
                <div>
                    <div className="search-wrapper">
                        <div style={{flex:1}}>
                            <LiveSearchInput
                                label="Caută Polițist"
                                placeholder="Nume, Prenume..."
                                apiUrl="http://localhost:8080/api/politisti/cauta"
                                // AICI E MODIFICAREA: Afișăm Gradul și Funcția
                                displayKey={(p) => `${p.nume} ${p.prenume} (${p.grad} - ${p.functie})`}
                                // Salvăm TOT obiectul
                                onSelect={(item) => setSelectedPolitist(item)}
                            />
                        </div>
                        <button className="search-btn-modern" onClick={handleCautaPolitist}>
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
                                            <td>{r.data_emitere ? r.data_emitere.split('T')[0] : '-'}</td>
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

                {/* 2. DOSAR CETĂȚEAN */}
                <div>
                    <div className="search-wrapper">
                        <div style={{flex:1}}>
                            <LiveSearchInput
                                label="Caută Cetățean"
                                placeholder="Nume sau CNP..."
                                apiUrl="http://localhost:8080/api/persoane/cauta"
                                displayKey={(p) => `${p.nume} ${p.prenume} (CNP: ${p.cnp})`}
                                onSelect={(item) => setSelectedPersoana(item)}
                            />
                        </div>
                        <button className="search-btn-modern" onClick={handleCautaCnp}>
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
                                    <div className="dossier-detail"><b>Data Nașterii:</b> {selectedPersoana.dataNasterii}</div>
                                </div>
                            </div>

                            <h4 style={{borderBottom:'1px solid #333'}}>ISTORIC AMENZI & SANCȚIUNI</h4>
                            {rezultatCnp.length > 0 ? (
                                <table className="dossier-table">
                                    <thead><tr><th>Motiv</th><th>Sumă</th><th>Status</th><th>Agent</th></tr></thead>
                                    <tbody>
                                    {rezultatCnp.map((r, i) => (
                                        <tr key={i}>
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