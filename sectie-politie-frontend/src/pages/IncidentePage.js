import React, { useState } from 'react';
import IncidenteList from '../components/IncidenteList';
import AddIncident from "../components/AddIncident";
import EditIncident from "../components/EditIncident";
import ViewIncident from "../components/ViewIncident";
import GestionareParticipanti from "../components/GestionareParticipanti";
import Modal from "../components/Modal";

const IncidentePage = () => {
    // --- STATE MODALE ---
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    // State pentru selectii
    const [editId, setEditId] = useState(null);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [participantsId, setParticipantsId] = useState(null);

    // --- REFRESH ---
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleAddSuccess = () => {
        setIsAddModalOpen(false);
        setRefreshTrigger(prev => prev + 1);
        alert("Incident adăugat!");
    };

    const handleEditSuccess = () => {
        setIsEditModalOpen(false);
        setEditId(null);
        setRefreshTrigger(prev => prev + 1);
        alert("Incident modificat!");
    };

    return (
        <div>
            {/* LISTA INTELIGENTA */}
            <IncidenteList
                refreshTrigger={refreshTrigger}
                onAddClick={() => setIsAddModalOpen(true)}
                onEditClick={(id) => { setEditId(id); setIsEditModalOpen(true); }}
                onViewClick={(inc) => { setSelectedIncident(inc); setIsViewModalOpen(true); }}
                onManageParticipantsClick={(id) => setParticipantsId(id)}
            />

            {/* --- MODALE --- */}

            {/* Add */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Adaugă Incident">
                <AddIncident onSaveSuccess={handleAddSuccess} onCancel={() => setIsAddModalOpen(false)} />
            </Modal>

            {/* Edit */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editează Incident">
                {editId && (
                    <EditIncident id={editId} onSaveSuccess={handleEditSuccess} onCancel={() => setIsEditModalOpen(false)} />
                )}
            </Modal>

            {/* View Detalii */}
            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Detalii Incident">
                {selectedIncident && (
                    <ViewIncident incident={selectedIncident} onClose={() => setIsViewModalOpen(false)} />
                )}
            </Modal>

            {/* Participanti (Mov) */}
            <Modal isOpen={!!participantsId} onClose={() => setParticipantsId(null)} title="Gestionare Participanți">
                {participantsId && (
                    <GestionareParticipanti incidentId={participantsId} onClose={() => setParticipantsId(null)} />
                )}
            </Modal>
        </div>
    );
};

export default IncidentePage;