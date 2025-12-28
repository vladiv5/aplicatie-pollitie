import React, { useState } from 'react';
import AdreseList from '../components/AdreseList';
import AddAdresa from '../components/AddAdresa';
import EditAdresa from '../components/EditAdresa'; // Importăm componenta de editare
import Modal from '../components/Modal';

const AdresePage = () => {
    // State pentru Add
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // State pentru Edit
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);

    const [refreshKey, setRefreshKey] = useState(0);

    // --- ADD Logic ---
    const handleAddSuccess = () => {
        setIsAddModalOpen(false);
        setRefreshKey(k => k + 1);
        alert("Adresă adăugată cu succes!");
    };

    // --- EDIT Logic ---
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
        alert("Adresă modificată cu succes!");
    };

    return (
        <div>
            <AdreseList
                key={refreshKey}
                onAddClick={() => setIsAddModalOpen(true)}
                onEditClick={handleOpenEdit} // Trimitem funcția către List
            />

            {/* Modal ADAUGĂ */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Adaugă Adresă Nouă">
                <AddAdresa
                    onSaveSuccess={handleAddSuccess}
                    onCancel={() => setIsAddModalOpen(false)}
                />
            </Modal>

            {/* Modal EDITEAZĂ */}
            <Modal isOpen={isEditModalOpen} onClose={handleCloseEdit} title="Editează Adresa">
                {editId && (
                    <EditAdresa
                        id={editId}
                        onSaveSuccess={handleEditSuccess}
                        onCancel={handleCloseEdit}
                    />
                )}
            </Modal>
        </div>
    );
};

export default AdresePage;