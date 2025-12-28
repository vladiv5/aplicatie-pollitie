import React, { useState } from "react";
import PolitistiList from '../components/PolitistiList';
import AddPolitist from "../components/AddPolitist";
import EditPolitist from "../components/EditPolitist"; // Importam componenta noua
import Modal from "../components/Modal";

const PolitistiPage = () => {
    // --- STATE PENTRU ADAUGARE ---
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // --- STATE PENTRU EDITARE (Nou) ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editId, setEditId] = useState(null); // ID-ul politistului pe care il editam

    // --- REFRESH LISTA ---
    const [refreshKey, setRefreshKey] = useState(0);

    // HANDLERS ADAUGARE
    const handleOpenAddModal = () => setIsAddModalOpen(true);
    const handleCloseAddModal = () => setIsAddModalOpen(false);

    const handleAddSuccess = () => {
        setIsAddModalOpen(false);
        setRefreshKey(prev => prev + 1); // Refresh lista
        alert("Polițist adăugat cu succes!");
    };

    // HANDLERS EDITARE (Sablonul pentru viitoarele pagini)
    const handleOpenEditModal = (id) => {
        setEditId(id); // Setam ID-ul selectat
        setIsEditModalOpen(true); // Deschidem modalul
    };

    const handleCloseEditModal = () => {
        setEditId(null);
        setIsEditModalOpen(false);
    };

    const handleEditSuccess = () => {
        setIsEditModalOpen(false);
        setEditId(null);
        setRefreshKey(prev => prev + 1); // Refresh lista pentru a vedea modificarile
        alert("Polițist modificat cu succes!");
    };

    return (
        <div>
            {/* Lista primeste acum si functia de editare */}
            <PolitistiList
                key={refreshKey}
                onAddClick={handleOpenAddModal}
                onEditClick={handleOpenEditModal}
            />

            {/* --- MODAL ADAUGARE --- */}
            <Modal isOpen={isAddModalOpen} onClose={handleCloseAddModal} title="Adaugă Polițist Nou">
                <AddPolitist
                    onSaveSuccess={handleAddSuccess}
                    onCancel={handleCloseAddModal}
                />
            </Modal>

            {/* --- MODAL EDITARE (Nou) --- */}
            <Modal isOpen={isEditModalOpen} onClose={handleCloseEditModal} title="Editează Polițist">
                {/* Randam componenta doar daca avem un ID setat */}
                {editId && (
                    <EditPolitist
                        id={editId}
                        onSaveSuccess={handleEditSuccess}
                        onCancel={handleCloseEditModal}
                    />
                )}
            </Modal>
        </div>
    );
};

export default PolitistiPage;