import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // <--- IMPORTURI
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
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // --- NAVIGARE ---
    const location = useLocation();
    const navigate = useNavigate();

    // 1. JUMP IN (Deschide Edit cand venim din alta parte)
    useEffect(() => {
        if (location.state && location.state.openEditId) {
            setEditId(location.state.openEditId);
            setIsEditModalOpen(true);
            // ATENTIE: NU mai curatam state-ul aici! Avem nevoie de el la iesire.
        }
    }, [location]);

    // 2. JUMP OUT (Functia inteligenta de inchidere)
    const handleCloseOrFinish = () => {
        // Inchidem modalul local
        setIsEditModalOpen(false);
        setEditId(null);

        // Verificam daca avem bilet de intoarcere
        if (location.state && location.state.returnTo) {
            navigate(location.state.returnTo, {
                state: {
                    triggerAction: location.state.returnAction,
                    triggerId: location.state.returnId
                }
            });
        } else {
            // Doar daca NU ne intoarcem, curatam istoricul
            window.history.replaceState({}, document.title);
        }
    };

    const handleAddSuccess = () => { setIsAddModalOpen(false); setRefreshTrigger(prev => prev + 1); alert("Incident adăugat!"); };

    // La succes, folosim tot handleCloseOrFinish
    const handleEditSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
        alert("Incident modificat!");
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
            />

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Adaugă Incident">
                <AddIncident onSaveSuccess={handleAddSuccess} onCancel={() => setIsAddModalOpen(false)} />
            </Modal>

            {/* AICI FOLOSIM handleCloseOrFinish la onClose si onCancel */}
            <Modal isOpen={isEditModalOpen} onClose={handleCloseOrFinish} title="Editează Incident">
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