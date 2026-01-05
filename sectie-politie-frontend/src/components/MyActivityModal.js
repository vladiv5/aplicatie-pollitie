import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './styles/TableStyles.css';
import toast from 'react-hot-toast';

// Importăm componentele de editare și Modalul generic
import EditIncident from './EditIncident';
import EditAmenda from './EditAmenda';
import Modal from './Modal';

const MyActivityModal = ({ userId, onClose }) => {
    // --- STATE DATE ---
    const [data, setData] = useState({
        incidente: [],
        amenzi: [],
        totalAmenziValoare: 0,
        totalIncidente: 0,
        totalAmenziCount: 0
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('incidente');

    // --- STATE PENTRU EDITARE ---
    const [editIncidentId, setEditIncidentId] = useState(null);
    const [editAmendaId, setEditAmendaId] = useState(null);

    // --- FUNCȚIE DE ÎNCĂRCARE DATE (Reutilizabilă) ---
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

    // Încărcăm la montare
    useEffect(() => {
        loadData();
    }, [loadData]);

    // --- HANDLERS PENTRU UPDATE ---
    const handleEditSuccess = () => {
        setEditIncidentId(null);
        setEditAmendaId(null);
        loadData(); // Reîmprospătăm datele din tabel
    };

    // --- HELPER STILURI ---
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('ro-RO');
    };

    const getIncidentStatusStyle = (status) => {
        switch(status) {
            case 'Activ': return { backgroundColor: '#28a745', color: 'white' }; // Verde
            case 'Închis': return { backgroundColor: '#6c757d', color: 'white' }; // Gri
            case 'Arhivat': return { backgroundColor: '#fd7e14', color: 'white' }; // Portocaliu
            default: return { backgroundColor: '#eee', color: '#333' };
        }
    };

    const getAmendaStatusStyle = (status) => {
        switch(status) {
            case 'Platita': return { color: '#28a745' }; // Verde
            case 'Neplatita': return { color: '#dc3545' }; // Rosu
            case 'Anulata': return { color: '#fd7e14' }; // Galben/Portocaliu (Mai vizibil decat galben pur pe alb)
            default: return { color: '#333' };
        }
    };

    return (
        <div style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>

            {/* STATISTICI RAPIDE */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', padding: '15px', background: '#f0f4f8', borderRadius: '8px', border: '1px solid #e1e4e8' }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                    <h4 style={{ margin: 0, color: '#0056b3', fontSize: '24px' }}>{data.totalIncidente}</h4>
                    <span style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>Dosare Instrumentate</span>
                </div>
                <div style={{ borderLeft: '1px solid #ccc' }}></div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                    <h4 style={{ margin: 0, color: '#28a745', fontSize: '24px' }}>{data.totalAmenziCount}</h4>
                    <span style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>Sancțiuni Aplicate</span>
                </div>
                <div style={{ borderLeft: '1px solid #ccc' }}></div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                    <h4 style={{ margin: 0, color: '#dc3545', fontSize: '24px' }}>{data.totalAmenziValoare} <span style={{fontSize: '14px'}}>RON</span></h4>
                    <span style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>Valoare Totală</span>
                </div>
            </div>

            {/* TABS */}
            <div style={{ display: 'flex', borderBottom: '2px solid #eee', marginBottom: '0' }}>
                <button
                    onClick={() => setActiveTab('incidente')}
                    style={{
                        flex: 1, padding: '12px', background: activeTab === 'incidente' ? 'white' : '#f9f9f9',
                        border: 'none', borderBottom: activeTab === 'incidente' ? '3px solid #0056b3' : 'none',
                        fontWeight: 'bold', color: activeTab === 'incidente' ? '#0056b3' : '#666', cursor: 'pointer'
                    }}
                >
                    📁 Incidente ({data.totalIncidente})
                </button>
                <button
                    onClick={() => setActiveTab('amenzi')}
                    style={{
                        flex: 1, padding: '12px', background: activeTab === 'amenzi' ? 'white' : '#f9f9f9',
                        border: 'none', borderBottom: activeTab === 'amenzi' ? '3px solid #0056b3' : 'none',
                        fontWeight: 'bold', color: activeTab === 'amenzi' ? '#0056b3' : '#666', cursor: 'pointer'
                    }}
                >
                    📄 Amenzi ({data.totalAmenziCount})
                </button>
            </div>

            {/* CONTENT */}
            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #eee', borderTop: 'none', background: 'white', minHeight: '300px' }}>
                {loading ? (
                    <p style={{ padding: '20px', textAlign: 'center' }}>Se încarcă datele...</p>
                ) : (
                    <>
                        {/* --- TABEL INCIDENTE --- */}
                        {activeTab === 'incidente' && (
                            <table className="styled-table" style={{ width: '100%', margin: 0, boxShadow: 'none', borderRadius: 0 }}>
                                <thead style={{ position: 'sticky', top: 0 }}>
                                <tr>
                                    <th>Tip</th>
                                    <th>Data</th>
                                    <th>Status</th>
                                    <th>Locație</th>
                                    <th style={{textAlign:'center'}}>Acțiuni</th>
                                </tr>
                                </thead>
                                <tbody>
                                {data.incidente.length > 0 ? data.incidente.map(inc => (
                                    <tr key={inc.idIncident}>
                                        <td>{inc.tipIncident}</td>
                                        <td>{formatDate(inc.dataEmitere)}</td>
                                        <td>
                                                <span style={{
                                                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px',
                                                    ...getIncidentStatusStyle(inc.status)
                                                }}>
                                                    {inc.status}
                                                </span>
                                        </td>
                                        <td style={{ fontSize: '13px' }}>{inc.descriereLocatie}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button className="action-btn edit-btn" onClick={() => setEditIncidentId(inc.idIncident)}>
                                                Editați
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="5" style={{textAlign:'center', padding: '30px', color: '#999'}}>Nu aveți incidente alocate.</td></tr>
                                )}
                                </tbody>
                            </table>
                        )}

                        {/* --- TABEL AMENZI --- */}
                        {activeTab === 'amenzi' && (
                            <table className="styled-table" style={{ width: '100%', margin: 0, boxShadow: 'none', borderRadius: 0 }}>
                                <thead style={{ position: 'sticky', top: 0 }}>
                                <tr>
                                    <th>Motiv</th>
                                    <th>Suma</th>
                                    <th>Stare</th>
                                    <th>Data</th>
                                    <th>Persoana</th>
                                    <th style={{textAlign:'center'}}>Acțiuni</th>
                                </tr>
                                </thead>
                                <tbody>
                                {data.amenzi.length > 0 ? data.amenzi.map(a => (
                                    <tr key={a.idAmenda}>
                                        <td>{a.motiv}</td>
                                        <td style={{fontWeight:'bold', color: 'black'}}>{a.suma} RON</td>
                                        <td>
                                                <span style={{
                                                    fontWeight: 'bold',
                                                    ...getAmendaStatusStyle(a.starePlata)
                                                }}>
                                                    {a.starePlata}
                                                </span>
                                        </td>
                                        <td>{formatDate(a.dataEmitere)}</td>
                                        <td>
                                            {a.persoana ? `${a.persoana.nume} ${a.persoana.prenume}` : <span style={{color:'#999'}}>Necunoscut</span>}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button className="action-btn edit-btn" onClick={() => setEditAmendaId(a.idAmenda)}>
                                                Editați
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="6" style={{textAlign:'center', padding: '30px', color: '#999'}}>Nu ați acordat amenzi.</td></tr>
                                )}
                                </tbody>
                            </table>
                        )}
                    </>
                )}
            </div>

            <div className="modal-footer" style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                <button className="action-btn" style={{ background: '#6c757d', color: 'white' }} onClick={onClose}>
                    Închideți
                </button>
            </div>

            {/* --- MODALE PENTRU EDITARE (NESTED MODALS) --- */}

            {/* Modal Edit Incident */}
            <Modal
                isOpen={!!editIncidentId}
                onClose={() => setEditIncidentId(null)}
                title="Editați Incident"
            >
                {editIncidentId && (
                    <EditIncident
                        id={editIncidentId}
                        onSaveSuccess={handleEditSuccess}
                        onCancel={() => setEditIncidentId(null)}
                    />
                )}
            </Modal>

            {/* Modal Edit Amenda */}
            <Modal
                isOpen={!!editAmendaId}
                onClose={() => setEditAmendaId(null)}
                title="Editați Amendă"
            >
                {editAmendaId && (
                    <EditAmenda
                        id={editAmendaId}
                        onSaveSuccess={handleEditSuccess}
                        onCancel={() => setEditAmendaId(null)}
                    />
                )}
            </Modal>

        </div>
    );
};

export default MyActivityModal;