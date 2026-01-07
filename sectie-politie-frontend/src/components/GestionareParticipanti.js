import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LiveSearchInput from './LiveSearchInput';
import toast from "react-hot-toast";
import './styles/Forms.css'; // Importăm stilurile globale

const GestionareParticipanti = ({ incidentId, onClose }) => {
    const [participanti, setParticipanti] = useState([]);
    const [persoanaSelectata, setPersoanaSelectata] = useState(null);
    const [calitate, setCalitate] = useState('Martor');
    const [isLoading, setIsLoading] = useState(true);

    const loadParticipanti = () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');

        axios.get(`http://localhost:8080/api/participanti/incident/${incidentId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => setParticipanti(res.data))
            .catch(err => console.error(err))
            .finally(() => {
                setTimeout(() => setIsLoading(false), 200);
            });
    };

    useEffect(() => {
        loadParticipanti();
    }, [incidentId]);

    const handleAdd = () => {
        if (!persoanaSelectata) {
            toast.error("Selectați o persoană!");
            return;
        }
        const token = localStorage.getItem('token');
        axios.post('http://localhost:8080/api/participanti', {
            incidentId: incidentId,
            persoanaId: persoanaSelectata.idPersoana,
            calitate: calitate
        }, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(() => {
                loadParticipanti();
                setPersoanaSelectata(null);
                toast.success("Persoană asociată cu succes!");
            })
            .catch(err => toast.error("Eroare: Persoana este deja adăugată!"));
    };

    const handleDelete = (persoanaId) => {
        const token = localStorage.getItem('token');
        axios.delete(`http://localhost:8080/api/participanti/${incidentId}/${persoanaId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(() => {
                loadParticipanti();
                toast.success("Persoană eliminată din incident!");
            })
            .catch(err => {
                console.error(err);
                toast.error("Eroare la eliminarea persoanei!");
            });
    };

    return (
        <div style={{ padding: '5px' }}>

            {/* ZONA DE ADAUGARE (STILIZATĂ CLEAN) */}
            <div style={{
                background: '#f8fafc',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '25px',
                border: '1px solid #e2e8f0',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03)'
            }}>
                <h5 className="form-label" style={{ fontSize: '0.9rem', marginBottom: '15px', color: '#64748b' }}>
                    <i className="fa-solid fa-user-plus"></i> Adăugați Participant Nou
                </h5>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <LiveSearchInput
                        label="Căutare Persoană"
                        placeholder="Introduceți nume sau CNP..."
                        apiUrl="http://localhost:8080/api/persoane/cauta"
                        displayKey={(p) => `${p.nume} ${p.prenume} (CNP: ${p.cnp})`}
                        onSelect={setPersoanaSelectata}
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '15px', alignItems: 'end' }}>
                        <div>
                            <label className="form-label">În calitate de:</label>
                            <select
                                className="modal-input"
                                value={calitate}
                                onChange={(e) => setCalitate(e.target.value)}
                            >
                                <option value="Martor">Martor</option>
                                <option value="Suspect">Suspect</option>
                                <option value="Victima">Victimă</option>
                                <option value="Reclamant">Reclamant</option>
                                <option value="Faptas">Făptaș</option>
                            </select>
                        </div>

                        <button className="save-btn" onClick={handleAdd} style={{ height: '42px', padding: '0 25px' }}>
                            ADAUGĂ
                        </button>
                    </div>
                </div>
            </div>

            {/* TABEL LISTA */}
            <div className="table-responsive">
                <table className="styled-table compact-table">
                    <thead>
                    <tr>
                        <th>Nume</th>
                        <th>Calitate</th>
                        <th style={{ textAlign: 'center' }}>Acțiune</th>
                    </tr>
                    </thead>
                    <tbody>

                    {isLoading ? (
                        <tr>
                            <td colSpan="3">
                                <div className="loading-container">
                                    <div className="spinner"></div>
                                    <span>Se încarcă lista...</span>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        participanti.length > 0 ? participanti.map((p, index) => (
                            <tr key={p.id.idPersoana}>
                                <td style={{ fontWeight: '500' }}>{p.persoana.nume} {p.persoana.prenume}</td>
                                <td>
                                    <span className="badge-status" style={{
                                        backgroundColor: (p.calitate === 'Suspect' || p.calitate === 'Faptas') ? '#fee2e2' :
                                            (p.calitate === 'Victima' ? '#fff7ed' : '#dcfce7'),
                                        color: (p.calitate === 'Suspect' || p.calitate === 'Faptas') ? '#991b1b' :
                                            (p.calitate === 'Victima' ? '#9a3412' : '#166534')
                                    }}>
                                        {p.calitate}
                                    </span>
                                </td>

                                {/* BUTON ȘTERGERE ICON-ONLY (TACTICAL RED) */}
                                <td style={{ textAlign: 'center' }}>
                                    <button
                                        className="btn-tactical-red"
                                        onClick={() => handleDelete(p.id.idPersoana)}
                                        title="Eliminați participantul"
                                    >
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>Niciun participant adăugat la acest dosar.</td></tr>
                        )
                    )}
                    </tbody>
                </table>
            </div>

            <div className="modal-footer">
                <button className="btn-close-modal" onClick={onClose}>ÎNCHIDEȚI</button>
            </div>
        </div>
    );
};

export default GestionareParticipanti;