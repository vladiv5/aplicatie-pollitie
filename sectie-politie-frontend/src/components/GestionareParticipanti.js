import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LiveSearchInput from './LiveSearchInput';
import './styles/TableStyles.css';
import toast from "react-hot-toast";

const GestionareParticipanti = ({ incidentId, onClose }) => {
    const [participanti, setParticipanti] = useState([]);
    const [persoanaSelectata, setPersoanaSelectata] = useState(null);
    const [calitate, setCalitate] = useState('Martor');

    // Încarcă lista existentă
    const loadParticipanti = () => {
        const token = localStorage.getItem('token');
        axios.get(`http://localhost:8080/api/participanti/incident/${incidentId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => setParticipanti(res.data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        loadParticipanti();
    }, [incidentId]);

    // Adăugați om nou
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
            .catch(err => toast.error("Eroare: Persoana este deja adăugată sau sistemul a eșuat."));
    };

    // Șterge om
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
        <div style={{ padding: '10px' }}>

            {/* ZONA DE ADAUGARE */}
            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '5px', marginBottom: '20px', border: '1px solid #eee' }}>
                <h5 style={{ marginTop: 0, marginBottom: '10px', color: '#555' }}>Adăugați un participant nou</h5>
                <LiveSearchInput
                    label=""
                    placeholder="Introduceți nume sau CNP..."
                    apiUrl="http://localhost:8080/api/persoane/cauta"
                    displayKey={(p) => `${p.nume} ${p.prenume} (CNP: ${p.cnp})`}
                    onSelect={setPersoanaSelectata}
                />

                <div style={{ marginTop: '15px', display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>În calitate de:</label>
                        <select
                            className="modal-input"
                            value={calitate}
                            onChange={(e) => setCalitate(e.target.value)}
                            style={{ width: '100%', padding: '8px' }}
                        >
                            <option value="Martor">Martor</option>
                            <option value="Suspect">Suspect</option>
                            <option value="Victima">Victimă</option>
                            <option value="Reclamant">Reclamant</option>
                            <option value="Faptas">Făptaș</option>
                        </select>
                    </div>

                    <button className="add-btn-primary" onClick={handleAdd} style={{ height: '38px', marginBottom: '1px' }}>
                        Adăugați
                    </button>
                </div>
            </div>

            {/* TABEL LISTA - WRAPPER CU UMBRA */}
            <div style={{
                borderRadius: '10px',
                width: '100%',
                marginTop: '10px',
                backgroundColor: 'white',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)' /* UMBRA AICI */
            }}>
                <table className="styled-table" style={{
                    width: '100%',
                    margin: 0,
                    boxShadow: 'none',
                    borderTopLeftRadius: '10px',
                    borderTopRightRadius: '10px',
                    borderCollapse: 'separate',
                    borderSpacing: 0
                }}>
                    <thead>
                    <tr>
                        <th style={{ borderTopLeftRadius: '10px' }}>Nume</th>
                        <th>Calitate</th>
                        <th style={{ textAlign: 'center', borderTopRightRadius: '10px' }}>Acțiune</th>
                    </tr>
                    </thead>
                    <tbody>
                    {participanti.length > 0 ? participanti.map((p, index) => (
                        <tr key={p.id.idPersoana} style={{ borderBottom: index === participanti.length - 1 ? 'none' : '1px solid #eee' }}>
                            <td style={{ padding: '12px 15px' }}>{p.persoana.nume} {p.persoana.prenume}</td>
                            <td>
                                <span style={{
                                    fontWeight: 'bold',
                                    color: (p.calitate === 'Suspect' || p.calitate === 'Faptas') ? '#dc3545' :
                                        (p.calitate === 'Victima' ? '#fd7e14' : '#28a745')
                                }}>
                                    {p.calitate}
                                </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                                <button className="action-btn delete-btn" onClick={() => handleDelete(p.id.idPersoana)} title="Eliminați participantul">
                                    Eliminați
                                </button>
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Niciun participant adăugat.</td></tr>
                    )}
                    </tbody>
                </table>
            </div>

            <div className="modal-footer" style={{ marginTop: '20px' }}>
                <button className="action-btn" onClick={onClose} style={{ background: '#6c757d', color: 'white' }}>Închideți</button>
            </div>
        </div>
    );
};

export default GestionareParticipanti;