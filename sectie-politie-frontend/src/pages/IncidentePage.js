import React, { useState } from 'react';
import IncidenteList from '../components/IncidenteList';
import AddIncident from "../components/AddIncident";
import EditIncident from "../components/EditIncident";
import ViewIncident from "../components/ViewIncident"; // Importam noua componenta
import Modal from "../components/Modal";

const IncidentePage = () => {
    // State-uri pentru Modale
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false); // State nou pentru View

    const [editId, setEditId] = useState(null);
    const [selectedIncident, setSelectedIncident] = useState(null); // Datele incidentului selectat pt vizualizare

    const [refreshKey, setRefreshKey] = useState(0);

    // --- LOGICA ADD ---
    const handleAddSuccess = () => {
        setIsAddModalOpen(false);
        setRefreshKey(k => k + 1);
        alert("Incident adăugat!");
    };

    // --- LOGICA EDIT ---
    const handleOpenEdit = (id) => {
        setEditId(id);
        setIsEditModalOpen(true);
    };

    const handleCloseEdit = () => {
        setEditId(null);
        setIsEditModalOpen(false);
    };

    const handleEditSuccess = () => {
        setIsEditModalOpen(false);
        setEditId(null);
        setRefreshKey(k => k + 1);
        alert("Incident modificat!");
    };

    // --- LOGICA VIEW (NOU) ---
    const handleOpenView = (incident) => {
        setSelectedIncident(incident);
        setIsViewModalOpen(true);
    };

    const handleCloseView = () => {
        setSelectedIncident(null);
        setIsViewModalOpen(false);
    };

    return (
        <div>
            <IncidenteList
                key={refreshKey}
                onAddClick={() => setIsAddModalOpen(true)}
                onEditClick={handleOpenEdit}
                onViewClick={handleOpenView} // Trimitem functia catre lista
            />

            {/* Modal Adaugare */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Adaugă Incident">
                <AddIncident
                    onSaveSuccess={handleAddSuccess}
                    onCancel={() => setIsAddModalOpen(false)}
                />
            </Modal>

            {/* Modal Editare */}
            <Modal isOpen={isEditModalOpen} onClose={handleCloseEdit} title="Editează Incident">
                {editId && (
                    <EditIncident
                        id={editId}
                        onSaveSuccess={handleEditSuccess}
                        onCancel={handleCloseEdit}
                    />
                )}
            </Modal>

            {/* Modal Vizualizare Detalii (NOU) */}
            <Modal isOpen={isViewModalOpen} onClose={handleCloseView} title="Detalii Incident">
                {selectedIncident && (
                    <ViewIncident
                        incident={selectedIncident}
                        onClose={handleCloseView}
                    />
                )}
            </Modal>
        </div>
    );
};

export default IncidentePage;