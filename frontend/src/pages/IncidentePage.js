/** Pagina principala pentru gestionarea Incidentelor
 * Include si functionalitatea "Bumerang" pentru stergeri blocate
 * @author Ivan Vlad-Daniel
 * @version 11 ianuarie 2026
 */
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import IncidenteList from '../components/IncidenteList';
import AddIncident from "../components/AddIncident";
import EditIncident from "../components/EditIncident";
import ViewIncident from "../components/ViewIncident";
import GestionareParticipanti from "../components/GestionareParticipanti";
import Modal from "../components/Modal";

const IncidentePage = () => {
    // --- State Modale ---
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const [editId, setEditId] = useState(null);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [participantsId, setParticipantsId] = useState(null);

    // --- State Refresh & Highlight ---
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [highlightId, setHighlightId] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();

    // 1. Verific daca am fost trimis aici pentru a rezolva un conflict (Jump In)
    useEffect(() => {
        if (location.state && location.state.openEditId) {
            setEditId(location.state.openEditId);
            setIsEditModalOpen(true);
        }
    }, [location]);

    // Logica Bumerang: Inchidere modal sau intoarcere la pagina sursa
    const handleCloseOrFinish = () => {
        const boomerang = sessionStorage.getItem('boomerang_pending');
        if (boomerang) {
            const data = JSON.parse(boomerang);
            if (data.returnRoute) {
                // Ma intorc la Politisti/PersoanePage pentru a continua stergerea
                navigate(data.returnRoute);
                return;
            }
        }

        setIsEditModalOpen(false);
        setEditId(null);
        window.history.replaceState({}, document.title);
    };

    const handleAddSuccess = (newId) => {
        setIsAddModalOpen(false);
        setHighlightId(newId);
        setRefreshTrigger(prev => prev + 1);
    };

    const handleEditSuccess = (savedId) => {
        const boomerang = sessionStorage.getItem('boomerang_pending');

        if (boomerang) {
            const data = JSON.parse(boomerang);
            navigate(data.returnRoute);
        } else {
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