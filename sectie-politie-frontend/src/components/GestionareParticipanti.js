import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LiveSearchInput from './LiveSearchInput';
import toast from "react-hot-toast";
import './styles/Forms.css';

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

            {/* --- ZONA DE ADAUGARE (REDESENATĂ PREMIUM) --- */}
            <div style={{
                // NOU: Fundal Gradient Navy, identic cu restul aplicației
                background: 'linear-gradient(180deg, #0a2647 0%, #05101e 100%)',
                padding: '25px',
                borderRadius: '10px',
                marginBottom: '30px',
                // NOU: Border Auriu strălucitor
                border: '1px solid #d4af37',
                // NOU: Umbră exterioară pentru a ieși în relief
                boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
            }}>
                <h5 className="form-label" style={{ fontSize: '1rem', marginBottom: '20px', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <i className="fa-solid fa-user-plus" style={{ marginRight: '10px' }}></i>
                    Adăugați Participant Nou
                </h5>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* LiveSearchInput va prelua automat stilurile globale pentru inputuri dark */}
                    <LiveSearchInput
                        label="Căutare Persoană"
                        placeholder="Introduceți nume sau CNP..."
                        apiUrl="http://localhost:8080/api/persoane/cauta"
                        displayKey={(p) => `${p.nume} ${p.prenume} (CNP: ${p.cnp})`}
                        onSelect={setPersoanaSelectata}
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', alignItems: 'end' }}>
                        <div>
                            {/* NOU: Eticheta este acum AURIE */}
                            <label className="form-label" style={{color:'#d4af37', fontWeight: '700'}}>În calitate de:</label>
                            <select
                                className="modal-input"
                                value={calitate}
                                onChange={(e) => setCalitate(e.target.value)}
                                // Am scos stilurile inline. Se bazează acum pe clasa globală .modal-input din TableStyles.css
                            >
                                <option value="Martor">Martor</option>
                                <option value="Suspect">Suspect</option>
                                <option value="Victima">Victimă</option>
                                <option value="Reclamant">Reclamant</option>
                            </select>
                        </div>

                        <button className="save-btn" onClick={handleAdd} style={{ height: '45px', padding: '0 30px', fontSize: '1rem' }}>
                            <i className="fa-solid fa-check" style={{marginRight:'8px'}}></i> ADAUGĂ
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
                                    <span style={{color: '#d4af37'}}>Se încarcă lista...</span>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        participanti.length > 0 ? participanti.map((p, index) => (
                            <tr key={p.id.idPersoana}>
                                <td style={{ fontWeight: '600', color: '#ffffff' }}>{p.persoana.nume} {p.persoana.prenume}</td>
                                <td>
                                    <span className="badge-status" style={{
                                        // Culori adaptate pentru Dark Mode
                                        backgroundColor: (p.calitate === 'Suspect' || p.calitate === 'Faptas') ? 'rgba(239, 68, 68, 0.2)' :
                                            (p.calitate === 'Victima' ? 'rgba(249, 115, 22, 0.2)' : 'rgba(16, 185, 129, 0.2)'),
                                        color: (p.calitate === 'Suspect' || p.calitate === 'Faptas') ? '#fca5a5' :
                                            (p.calitate === 'Victima' ? '#fdba74' : '#6ee7b7'),
                                        border: (p.calitate === 'Suspect' || p.calitate === 'Faptas') ? '1px solid #991b1b' :
                                            (p.calitate === 'Victima' ? '1px solid #9a3412' : '1px solid #065f46')
                                    }}>
                                        {p.calitate}
                                    </span>
                                </td>

                                {/* BUTON ȘTERGERE ICON-ONLY */}
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
                            <tr><td colSpan="3" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontStyle: 'italic' }}>Niciun participant adăugat la acest dosar.</td></tr>
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