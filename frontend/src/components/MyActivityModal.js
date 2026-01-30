/** Modalul pentru vizualizarea dosarului personal al unui politist
 * @author Ivan Vlad-Daniel
 * @version 11 ianuarie 2026
 */
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './styles/TableStyles.css';
import toast from 'react-hot-toast';
import EditIncident from './EditIncident';
import EditAmenda from './EditAmenda';
import Modal from './Modal';
import './styles/Home.css'

const MyActivityModal = ({ userId, onClose }) => {
    const [data, setData] = useState({
        incidente: [], amenzi: [], totalAmenziValoare: 0, totalIncidente: 0, totalAmenziCount: 0
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('incidente');

    // Stari pentru editarea rapida din dosar
    const [editIncidentId, setEditIncidentId] = useState(null);
    const [editAmendaId, setEditAmendaId] = useState(null);

    const loadData = useCallback(() => {
        const token = localStorage.getItem('token');
        if (!userId) return;

        axios.get(`http://localhost:8080/api/politisti/${userId}/dosar-personal`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                setData(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                toast.error("Nu s-a putut actualiza dosarul.");
                setLoading(false);
            });
    }, [userId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleEditSuccess = () => {
        setEditIncidentId(null);
        setEditAmendaId(null);
        loadData(); // Reincarcam datele dupa editare
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('ro-RO', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="my-activity-modal-container">
            {/* Dashboard Mini - Statistici */}
            <div className="dosar-stats-container">
                <div className="stat-box">
                    <h4 className="stat-value">{data.totalIncidente}</h4>
                    <span className="shortcut-desc">Dosare Instrumentate</span>
                </div>
                <div className="stat-box">
                    <h4 className="stat-value">{data.totalAmenziCount}</h4>
                    <span className="shortcut-desc">Sancțiuni Aplicate</span>
                </div>
                <div className="stat-box">
                    <h4 className="stat-value money">
                        {data.totalAmenziValoare} <small style={{fontSize: '14px'}}>RON</small>
                    </h4>
                    <span className="shortcut-desc">Valoare Totală</span>
                </div>
            </div>

            {/* Tab-uri navigare */}
            <div className="modal-tabs">
                <button className={`tab-btn ${activeTab === 'incidente' ? 'active' : ''}`} onClick={() => setActiveTab('incidente')}>
                    <i className="fa-solid fa-folder"></i> Incidente ({data.totalIncidente})
                </button>
                <button className={`tab-btn ${activeTab === 'amenzi' ? 'active' : ''}`} onClick={() => setActiveTab('amenzi')}>
                    <i className="fa-solid fa-file-invoice"></i> Amenzi ({data.totalAmenziCount})
                </button>
            </div>

            {/* Continut Tab */}
            <div className="table-responsive" style={{ borderTop: 'none', background: 'white', minHeight: '350px' }}>
                {loading ? (
                    <div className="loading-container"><div className="spinner"></div><p>Se încarcă datele operative...</p></div>
                ) : (
                    <>
                        {activeTab === 'incidente' && (
                            <table className="styled-table compact-table">
                                <thead>
                                <tr><th>Tip</th><th>Data</th><th>Status</th><th>Locație</th><th style={{textAlign:'center'}}>Acțiuni</th></tr>
                                </thead>
                                <tbody>
                                {data.incidente.length > 0 ? data.incidente.map(inc => (
                                    <tr key={inc.idIncident}>
                                        <td style={{fontWeight: '600'}}>{inc.tipIncident}</td>
                                        <td>{formatDate(inc.dataEmitere)}</td>
                                        <td><span className={`badge-status ${inc.status === 'Închis' ? 'status-inchis' : 'status-arhivat'}`}>{inc.status}</span></td>
                                        <td>{inc.descriereLocatie}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button className="btn-tactical" onClick={() => setEditIncidentId(inc.idIncident)} title="Editați"><i className="fa-solid fa-pen-to-square"></i></button>
                                        </td>
                                    </tr>
                                )) : <tr><td colSpan="5" className="text-center">Nu există incidente.</td></tr>}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'amenzi' && (
                            <table className="styled-table compact-table">
                                <thead>
                                <tr><th>Motiv</th><th>Suma</th><th>Stare</th><th>Data</th><th>Persoana</th><th style={{textAlign:'center'}}>Acțiuni</th></tr>
                                </thead>
                                <tbody>
                                {data.amenzi.length > 0 ? data.amenzi.map(a => (
                                    <tr key={a.idAmenda}>
                                        <td>{a.motiv}</td>
                                        <td style={{fontWeight:'bold', color: 'var(--royal-navy-dark)'}}>{a.suma} RON</td>
                                        <td><span className="badge-status">{a.starePlata}</span></td>
                                        <td>{formatDate(a.dataEmitere)}</td>
                                        <td>{a.persoana ? `${a.persoana.nume} ${a.persoana.prenume}` : <span style={{color:'#999'}}>Nespecificat</span>}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button className="btn-tactical" onClick={() => setEditAmendaId(a.idAmenda)} title="Editați"><i className="fa-solid fa-pen-to-square"></i></button>
                                        </td>
                                    </tr>
                                )) : <tr><td colSpan="6" className="text-center">Nu există sancțiuni.</td></tr>}
                                </tbody>
                            </table>
                        )}
                    </>
                )}
            </div>

            {/* Modale de editare nested */}
            <Modal isOpen={!!editIncidentId} onClose={() => setEditIncidentId(null)} title="Editați Incident Operativ">
                {editIncidentId && <EditIncident id={editIncidentId} onSaveSuccess={handleEditSuccess} onCancel={() => setEditIncidentId(null)} />}
            </Modal>

            <Modal isOpen={!!editAmendaId} onClose={() => setEditAmendaId(null)} title="Editați Proces Verbal">
                {editAmendaId && <EditAmenda id={editAmendaId} onSaveSuccess={handleEditSuccess} onCancel={() => setEditAmendaId(null)} />}
            </Modal>
        </div>
    );
};

export default MyActivityModal;