import React from 'react';
import './styles/TableStyles.css';

const ViewIncident = ({ incident, onClose }) => {
    if (!incident) return null;

    return (
        <div className="view-container">
            <div className="view-row">
                <strong>Tip Incident: </strong>
                <span>{incident.tipIncident}</span>
            </div>

            <div className="view-row">
                <strong>Data și Ora: </strong>
                <span>{incident.dataEmitere ? incident.dataEmitere.replace('T', ' ') : '-'}</span>
            </div>

            <hr style={{margin: '10px 0', border: '0', borderTop: '1px solid #eee'}}/>

            <div className="view-row">
                <strong>Polițist Responsabil: </strong>
                <span>
                    {incident.politistResponsabil
                        ? `${incident.politistResponsabil.nume} ${incident.politistResponsabil.prenume} (${incident.politistResponsabil.grad})`
                        : 'Nealocat'}
                </span>
            </div>

            <div className="view-row">
                <strong>Adresă Exactă: </strong>
                {/* AICI REZOLVAM PROBLEMA "STR STR": Afisam doar variabila din baza de date */}
                <span>
                    {incident.adresaIncident
                        ? `${incident.adresaIncident.strada}, Nr. ${incident.adresaIncident.numar}, ${incident.adresaIncident.localitate}`
                        : 'Nespecificată'}
                </span>
            </div>

            <div className="view-row">
                <strong>Descriere Locație: </strong>
                <span>{incident.descriereLocatie || '-'}</span>
            </div>

            <hr style={{margin: '10px 0', border: '0', borderTop: '1px solid #eee'}}/>

            <div className="view-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <strong>Descriere Detaliată: </strong>
                <p style={{
                    background: '#f9f9f9',
                    padding: '10px',
                    borderRadius: '4px',
                    width: '100%',
                    marginTop: '5px',
                    whiteSpace: 'pre-wrap' // Păstrează rândurile noi din text
                }}>
                    {incident.descriereIncident || 'Fără descriere.'}
                </p>
            </div>

            <div className="modal-footer">
                <button className="action-btn delete-btn" onClick={onClose} style={{background: '#6c757d'}}>
                    Închide
                </button>
            </div>
        </div>
    );
};

export default ViewIncident;