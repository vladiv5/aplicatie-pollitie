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

    // --- MODIFICARE AICI: Logica Bumerang pe X / Anuleaza ---
    const handleCloseOrFinish = () => {
        // 1. Verificam Bumerangul
        const boomerang = sessionStorage.getItem('boomerang_pending');
        if (boomerang) {
            const data = JSON.parse(boomerang);
            if (data.returnRoute) {
                // Ne intoarcem la PolitistiPage (acolo se va face highlight)
                navigate(data.returnRoute);
                return; // STOP AICI
            }
        }

        // 2. Comportament Normal (daca nu e Bumerang)
        setIsEditModalOpen(false);
        setEditId(null);
        window.history.replaceState({}, document.title);
    };

    const handleAddSuccess = (newId) => {
        setIsAddModalOpen(false);
        setHighlightId(newId);
        setRefreshTrigger(prev => prev + 1);
    };

    // --- MODIFICARE AICI: Logica Bumerang pe SAVE ---
    const handleEditSuccess = (savedId) => {
        const boomerang = sessionStorage.getItem('boomerang_pending');

        if (boomerang) {
            const data = JSON.parse(boomerang);
            navigate(data.returnRoute); // Plecam inapoi
        } else {
            // Ramanem aici
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

            {/* AICI FOLOSIM handleCloseOrFinish LA AMBELE EVENT-URI */}
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