import React, { useState } from "react";
import PolitistiList from '../components/PolitistiList';
import AddPolitist from "../components/AddPolitist";
import EditPolitist from "../components/EditPolitist";
import Modal from "../components/Modal";

const PolitistiPage = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);

    // Un simplu contor pentru a forța reîncărcarea listei
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // HANDLERS MODALE
    const handleAddSuccess = () => {
        setIsAddModalOpen(false);
        setRefreshTrigger(prev => prev + 1); // Semnalizam listei sa faca refresh
        alert("Polițist adăugat!");
    };

    const handleEditSuccess = () => {
        setIsEditModalOpen(false);
        setEditId(null);
        setRefreshTrigger(prev => prev + 1); // Semnalizam listei sa faca refresh
        alert("Polițist modificat!");
    };

    return (
        <div className="page-wrapper">
            {/* Lista se descurca singura, primeste doar semnal de refresh si functii pt modale */}
            <PolitistiList
                refreshTrigger={refreshTrigger}
                onAddClick={() => setIsAddModalOpen(true)}
                onEditClick={(id) => { setEditId(id); setIsEditModalOpen(true); }}
            />

            {/* MODALELE raman aici pentru a fi deasupra la toate */}
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