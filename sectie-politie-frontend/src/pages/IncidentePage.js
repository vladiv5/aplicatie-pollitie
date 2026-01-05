import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

    const [editId, setEditId] = useState(null);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [participantsId, setParticipantsId] = useState(null);

    // REFRESH & HIGHLIGHT
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [highlightId, setHighlightId] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();

    // 1. JUMP IN (Deschide Edit cand venim din alta parte)
    useEffect(() => {
        if (location.state && location.state.openEditId) {
            setEditId(location.state.openEditId);
            setIsEditModalOpen(true);
        }
    }, [location]);

    // 2. CLOSE HANDLER
    const handleCloseOrFinish = () => {
        setIsEditModalOpen(false);
        setEditId(null);
        // Curățăm state-ul din history ca să nu se redeschidă la refresh
        window.history.replaceState({}, document.title);
    };

    const handleAddSuccess = (newId) => {
        setIsAddModalOpen(false);
        setHighlightId(newId);
        setRefreshTrigger(prev => prev + 1);
    };

    // --- MODIFICARE CRITICĂ AICI ---
    const handleEditSuccess = (savedId) => {
        // Verificăm dacă avem bilet de întoarcere (Bumerang)
        const boomerang = sessionStorage.getItem('boomerang_pending');

        if (boomerang) {
            const data = JSON.parse(boomerang);
            // Dacă există, NU mai facem refresh aici, ci plecăm direct înapoi
            // Pagina destinație (PolitistiPage) va ști ce să facă (highlight la triggerId)
            navigate(data.returnRoute);
        } else {
            // Comportament normal (Rămânem aici, facem highlight la incident)
            setRefreshTrigger(prev => prev + 1);
            setHighlightId(savedId);
            handleCloseOrFinish();
        }
    };

    return (
        <div>
            <IncidenteList
                refreshTrigger={refreshTrigger}
                onAddClick={() => setIsAddModalOpen(true)}
                onEditClick={(id) => { setEditId(id); setIsEditModalOpen(true); }}
                onViewClick={(inc) => { setSelectedIncident(inc); setIsViewModalOpen(true); }}
                onManageParticipantsClick={(id) => setParticipantsId(id)}

                highlightId={highlightId}
                onHighlightComplete={() => setHighlightId(null)}
            />

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