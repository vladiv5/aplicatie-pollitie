/**
 * Component for adding/removing people involved in an incident (Witnesses, Suspects).
 * @author Ivan Vlad-Daniel
 * @version January 11, 2026
 */
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

    // I load the current list of participants when the modal opens.
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

    // I handle adding a new participant selected via LiveSearch.
    const handleAdd = () => {
        if (!persoanaSelectata) {
            toast.error("Select a person!");
            return;
        }
        const token = localStorage.getItem('token');
        axios.post('http://localhost:8080/api/participanti', {
            incidentId: incidentId,
            persoanaId: persoanaSelectata.idPersoana,
            calitate: calitate
        }, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(() => {
                loadParticipanti(); // I reload the list to reflect the addition.
                setPersoanaSelectata(null);
                toast.success("Person associated successfully!");
            })
            .catch(() => toast.error("Error: Person already added!"));
    };

    // I handle removing a participant from the list.
    const handleDelete = (persoanaId) => {
        const token = localStorage.getItem('token');
        axios.delete(`http://localhost:8080/api/participanti/${incidentId}/${persoanaId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(() => {
                loadParticipanti();
                toast.success("Person removed from incident!");
            })
            .catch(err => {
                console.error(err);
                toast.error("Error removing person!");
            });
    };

    return (
        <div style={{ padding: '5px' }}>
            {/* Adding Area (Search + Role Select) */}
            <div style={{
                background: 'linear-gradient(180deg, #0a2647 0%, #05101e 100%)',
                padding: '25px',
                borderRadius: '10px',
                marginBottom: '30px',
                border: '1px solid #d4af37',
                boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
            }}>
                <h5 className="form-label" style={{ fontSize: '1rem', marginBottom: '20px', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <i className="fa-solid fa-user-plus" style={{ marginRight: '10px' }}></i>
                    Add New Participant
                </h5>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <LiveSearchInput
                        label="Search Person"
                        placeholder="Enter name or CNP..."
                        apiUrl="http://localhost:8080/api/persoane/cauta"
                        displayKey={(p) => `${p.nume} ${p.prenume} (CNP: ${p.cnp})`}
                        onSelect={setPersoanaSelectata}
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', alignItems: 'end' }}>
                        <div>
                            <label className="form-label" style={{color:'#d4af37', fontWeight: '700'}}>Role:</label>
                            <select
                                className="modal-input"
                                value={calitate}
                                onChange={(e) => setCalitate(e.target.value)}
                            >
                                <option value="Martor">Witness</option>
                                <option value="Suspect">Suspect</option>
                                <option value="Victima">Victim</option>
                                <option value="Reclamant">Complainant</option>
                            </select>
                        </div>

                        <button className="save-btn" onClick={handleAdd} style={{ height: '45px', padding: '0 30px', fontSize: '1rem' }}>
                            <i className="fa-solid fa-check" style={{marginRight:'8px'}}></i> ADD
                        </button>
                    </div>
                </div>
            </div>

            {/* Table of existing participants */}
            <div className="table-responsive">
                <table className="styled-table compact-table">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Role</th>
                        <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {isLoading ? (
                        <tr><td colSpan="3"><div className="loading-container"><div className="spinner"></div><span style={{color: '#d4af37'}}>Loading list...</span></div></td></tr>
                    ) : (
                        participanti.length > 0 ? participanti.map((p) => (
                            <tr key={p.id.idPersoana}>
                                <td style={{ fontWeight: '600', color: '#ffffff' }}>{p.persoana.nume} {p.persoana.prenume}</td>
                                <td>
                                    {/* I dynamically style the badge based on the participant's role (Suspect = Red, Victim = Orange). */}
                                    <span className="badge-status" style={{
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
                                <td style={{ textAlign: 'center' }}>
                                    <button className="btn-tactical-red" onClick={() => handleDelete(p.id.idPersoana)} title="Eliminați participantul">
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="3" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontStyle: 'italic' }}>No participants added to this file.</td></tr>
                        )
                    )}
                    </tbody>
                </table>
            </div>

            <div className="modal-footer">
                <button className="btn-close-modal" onClick={onClose}>CLOSE</button>
            </div>
        </div>
    );
};

export default GestionareParticipanti;