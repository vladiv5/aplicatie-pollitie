/**
 * Read-Only Component for viewing incident details.
 * @author Ivan Vlad-Daniel
 * @version January 11, 2026
 */
import React from 'react';
import './styles/Forms.css';

const ViewIncident = ({ incident, onClose }) => {
    if (!incident) return null;

    const formatData = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('ro-RO', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // Style for inactive fields (Read-Only)
    const readOnlyFieldStyle = {
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        padding: '10px',
        borderRadius: '6px',
        color: '#334155',
        fontSize: '0.9rem',
        fontWeight: '500'
    };

    const labelStyle = {
        display: 'block', fontSize: '0.75rem', textTransform: 'uppercase',
        color: '#64748b', fontWeight: 'bold', marginBottom: '4px'
    };

    return (
        <div style={{ padding: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                    <span style={labelStyle}>Incident Type</span>
                    <div style={readOnlyFieldStyle}>{incident.tipIncident}</div>
                </div>
                <div>
                    <span style={labelStyle}>Date and Time</span>
                    <div style={readOnlyFieldStyle}>{formatData(incident.dataEmitere)}</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                    <span style={labelStyle}>Status</span>
                    <div style={{...readOnlyFieldStyle, color: incident.status === 'Activ' ? '#166534' : '#475569', fontWeight: 'bold'}}>
                        {incident.status || 'Activ'}
                    </div>
                </div>
                <div>
                    <span style={labelStyle}>Responsible Officer</span>
                    <div style={readOnlyFieldStyle}>
                        {incident.politistResponsabil
                            ? `${incident.politistResponsabil.nume} ${incident.politistResponsabil.prenume}`
                            : 'Unassigned'}
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
                <span style={labelStyle}>Address & Location</span>
                <div style={readOnlyFieldStyle}>
                    {incident.adresaIncident
                        ? `${incident.adresaIncident.strada}, Nr. ${incident.adresaIncident.numar}, ${incident.adresaIncident.localitate}`
                        : ''}
                    {incident.descriereLocatie ? ` (${incident.descriereLocatie})` : ''}
                </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
                <span style={labelStyle}>Detailed Description</span>
                <div style={{ ...readOnlyFieldStyle, minHeight: '80px', whiteSpace: 'pre-wrap' }}>
                    {incident.descriereIncident || 'No description.'}
                </div>
            </div>

            <div className="modal-footer">
                <button className="btn-close-modal" onClick={onClose}>CLOSE</button>
            </div>
        </div>
    );
};

export default ViewIncident;