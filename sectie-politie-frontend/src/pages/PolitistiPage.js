import React, { useState } from "react";
import PolitistiList from '../components/PolitistiList';
import AddPolitist from "../components/AddPolitist";
import EditPolitist from "../components/EditPolitist";
import Modal from "../components/Modal";
import toast from 'react-hot-toast';

const PolitistiPage = () => {
    // --- STATE MODALE ADD/EDIT (Globale pentru pagina) ---
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);

    // Un simplu contor pentru a forța reîncărcarea listei dupa Add/Edit
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleAddSuccess = () => {
        setIsAddModalOpen(false);
        setRefreshTrigger(prev => prev + 1);
    };

    const handleEditSuccess = () => {
        setIsEditModalOpen(false);
        setEditId(null);
        setRefreshTrigger(prev => prev + 1);

    };

    return (
        <div className="page-wrapper">
            {/* Lista primeste doar trigger-ul de refresh si callback-urile pt Add/Edit */}
            {/* Logica de stergere e capsulata in interiorul listei */}
            <PolitistiList
                refreshTrigger={refreshTrigger}
                onAddClick={() => setIsAddModalOpen(true)}
                onEditClick={(id) => { setEditId(id); setIsEditModalOpen(true); }}
            />

            {/* MODALELE ADD / EDIT Raman la nivel de pagina */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Adaugă Polițist">
                <AddPolitist onSaveSuccess={handleAddSuccess} onCancel={() => setIsAddModalOpen(false)} />
            </Modal>

            <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditId(null); }} title="Editează Polițist">
                {editId && <EditPolitist id={editId} onSaveSuccess={handleEditSuccess} onCancel={() => setIsEditModalOpen(false)} />}
            </Modal>
        </div>
    );
};

export default PolitistiPage;