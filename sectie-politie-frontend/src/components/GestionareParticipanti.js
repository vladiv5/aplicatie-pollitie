import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LiveSearchInput from './LiveSearchInput';
import './styles/TableStyles.css';

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

    // Adaugă om nou
    const handleAdd = () => {
        if (!persoanaSelectata) {
            alert("Selectează o persoană!");
            return;
        }
        const token = localStorage.getItem('token');
        axios.post('http://localhost:8080/api/participanti', {
            incidentId: incidentId,
            persoanaId: persoanaSelectata.idPersoana,
            calitate: calitate
        }, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(() => {
                loadParticipanti(); // Refresh listă
                setPersoanaSelectata(null); // Reset
            })
            .catch(err => alert("Eroare (poate persoana e deja adăugată?)"));
    };

    // Șterge om
    const handleDelete = (persoanaId) => {
        const token = localStorage.getItem('token');
        axios.delete(`http://localhost:8080/api/participanti/${incidentId}/${persoanaId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(() => loadParticipanti())
            .catch(err => console.error(err));
    };

    return (
        <div style={{ padding: '10px' }}>
            <h3>Participanți la Incident #{incidentId}</h3>

            {/* ZONA DE ADAUGARE */}
            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
                <h5>Adaugă Persoană</h5>
                <LiveSearchInput
                    label="Caută Persoană"
                    placeholder="Nume sau CNP..."
                    apiUrl="http://localhost:8080/api/persoane/cauta"
                    displayKey={(p) => `${p.nume} ${p.prenume} (CNP: ${p.cnp})`}
                    onSelect={setPersoanaSelectata}
                />

                <div style={{ marginTop: '10px' }}>
                    <label>În calitate de: </label>
                    <select
                        className="modal-input"
                        value={calitate}
                        onChange={(e) => setCalitate(e.target.value)}
                        style={{ marginLeft: '10px', width: '150px' }}
                    >
                        <option value="Martor">Martor</option>
                        <option value="Suspect">Suspect</option>
                        <option value="Victima">Victima</option>
                        <option value="Reclamant">Reclamant</option>
                    </select>

                    <button className="add-btn-primary" onClick={handleAdd} style={{ marginLeft: '10px' }}>
                        Adaugă
                    </button>
                </div>
            </div>

            {/* TABEL LISTA */}
            <table className="styled-table">
                <thead>
                <tr>
                    <th>Nume</th>
                    <th>Calitate</th>
                    <th>Acțiune</th>
                </tr>
                </thead>
                <tbody>
                {participanti.map(p => (
                    <tr key={p.id.idPersoana}>
                        <td>{p.persoana.nume} {p.persoana.prenume}</td>
                        <td>
                                <span style={{
                                    fontWeight: 'bold',
                                    color: p.calitate === 'Suspect' || p.calitate === 'Faptas' ? 'red' : 'green'
                                }}>
                                    {p.calitate}
                                </span>
                        </td>
                        <td>
                            <button className="action-btn delete-btn" onClick={() => handleDelete(p.id.idPersoana)}>
                                Scoate
                            </button>
                        </td>
                    </tr>
                ))}
                {participanti.length === 0 && <tr><td colSpan="3">Niciun participant adăugat.</td></tr>}
                </tbody>
            </table>

            <div className="modal-footer" style={{marginTop: '20px'}}>
                <button className="action-btn" onClick={onClose} style={{background: '#6c757d', color: 'white'}}>Închide</button>
            </div>
        </div>
    );
};

export default GestionareParticipanti;