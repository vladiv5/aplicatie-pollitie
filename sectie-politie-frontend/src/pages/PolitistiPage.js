import React, { useState } from "react";
import PolitistiList from '../components/PolitistiList';
import AddPolitist from "../components/AddPolitist";
import EditPolitist from "../components/EditPolitist";
import Modal from "../components/Modal";

const PolitistiPage = () => {
    //State Modale
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);

    //State Focus & Refresh
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [highlightId, setHighlightId] = useState(null);

    const handleAddSuccess = (newId) => {
        setIsAddModalOpen(false);
        setHighlightId(newId);
        setRefreshTrigger(prev => prev + 1);
    };

    const handleEditSuccess = (savedId) => {
        setIsEditModalOpen(false);
        setEditId(null);
        setHighlightId(savedId);
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="page-wrapper">
            <PolitistiList
                refreshTrigger={refreshTrigger}
                onAddClick={() => setIsAddModalOpen(true)}
                onEditClick={(id) => { setEditId(id); setIsEditModalOpen(true); }}

                // Trimitem Props pentru efectul vizual
                highlightId={highlightId}
                onHighlightComplete={() => setHighlightId(null)}

                // IMPORTANT: Trimitem setter-ul ca să poată fi activat din listă la Bumerang
                setHighlightId={setHighlightId}
            />

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Adăugați Polițist">
                <AddPolitist onSaveSuccess={handleAddSuccess} onCancel={() => setIsAddModalOpen(false)} />
            </Modal>

            <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditId(null); }} title="Editați Polițist">
                {editId && <EditPolitist id={editId} onSaveSuccess={handleEditSuccess} onCancel={() => setIsEditModalOpen(false)} />}
            </Modal>
        </div>
    );
};

export default PolitistiPage;