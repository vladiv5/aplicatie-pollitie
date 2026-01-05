import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import IncidenteList from '../components/IncidenteList';
import AddIncident from "../components/AddIncident";
import EditIncident from "../components/EditIncident";
import ViewIncident from "../components/ViewIncident";
import GestionareParticipanti from "../components/GestionareParticipanti";
import Modal from "../components/Modal";

const IncidentePage = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const [editId, setEditId] = useState(null);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [participantsId, setParticipantsId] = useState(null);

    // REFRESH & HIGHLIGHT
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [highlightId, setHighlightId] = useState(null); // <--- STATE NOU

    const location = useLocation();
    const navigate = useNavigate();

    // 1. JUMP IN
    useEffect(() => {
        if (location.state && location.state.openEditId) {
            setEditId(location.state.openEditId);
            setIsEditModalOpen(true);
        }
    }, [location]);

    // 2. JUMP OUT
    const handleCloseOrFinish = () => {
        setIsEditModalOpen(false);
        setEditId(null);
        if (location.state && location.state.returnTo) {
            navigate(location.state.returnTo, {
                state: {
                    triggerAction: location.state.returnAction,
                    triggerId: location.state.returnId
                }
            });
        } else {
            window.history.replaceState({}, document.title);
        }
    };

    const handleAddSuccess = (newId) => { // Primim ID
        setIsAddModalOpen(false);
        setHighlightId(newId); // Setam Focus
        setRefreshTrigger(prev => prev + 1);
    };

    const handleEditSuccess = (savedId) => { // Primim ID
        setRefreshTrigger(prev => prev + 1);
        setHighlightId(savedId); // Setam Focus
        handleCloseOrFinish();
    };

    return (
        <div>
            <IncidenteList
                refreshTrigger={refreshTrigger}
                onAddClick={() => setIsAddModalOpen(true)}
                onEditClick={(id) => { setEditId(id); setIsEditModalOpen(true); }}
                onViewClick={(inc) => { setSelectedIncident(inc); setIsViewModalOpen(true); }}
                onManageParticipantsClick={(id) => setParticipantsId(id)}
                // PROPS NOI
                highlightId={highlightId}
                onHighlightComplete={() => setHighlightId(null)}
            />

            {/* MODALELE raman la fel, doar le-am legat la noile handlere */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Adăugați Incident">
                <AddIncident onSaveSuccess={handleAddSuccess} onCancel={() => setIsAddModalOpen(false)} />
            </Modal>

            <Modal isOpen={isEditModalOpen} onClose={handleCloseOrFinish} title="Editați Incident">
                {editId && <EditIncident id={editId} onSaveSuccess={handleEditSuccess} onCancel={handleCloseOrFinish} />}
            </Modal>

            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Detalii Incident">
                {selectedIncident && <ViewIncident incident={selectedIncident} onClose={() => setIsViewModalOpen(false)} />}
            </Modal>
            <Modal isOpen={!!participantsId} onClose={() => setParticipantsId(null)} title="Gestionare Participanți">
                {participantsId && <GestionareParticipanti incidentId={participantsId} onClose={() => setParticipantsId(null)} />}
            </Modal>
        </div>
    );
};

export default IncidentePage;