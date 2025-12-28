import React, { useState } from 'react';
import AmenziList from '../components/AmenziList';
import AddAmenda from '../components/AddAmenda';
import EditAmenda from '../components/EditAmenda'; // Nu uita să-l importi
import Modal from '../components/Modal';

const AmenziPage = () => {
    // State pentru Add Modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // State pentru Edit Modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);

    const [refreshKey, setRefreshKey] = useState(0);

    // --- Add Handlers ---
    const handleAddSuccess = () => {
        setIsAddModalOpen(false);
        setRefreshKey(k => k + 1);
        alert("Amendă adăugată cu succes!");
    };

    // --- Edit Handlers ---
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
        alert("Amendă modificată cu succes!");
    };

    return (
        <div>
            <AmenziList
                key={refreshKey}
                onAddClick={() => setIsAddModalOpen(true)}
                onEditClick={handleOpenEdit}
            />

            {/* Modal ADD */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Adaugă Amendă Nouă">
                <AddAmenda
                    onSaveSuccess={handleAddSuccess}
                    onCancel={() => setIsAddModalOpen(false)}
                />
            </Modal>

            {/* Modal EDIT */}
            <Modal isOpen={isEditModalOpen} onClose={handleCloseEdit} title="Editează Amendă">
                {editId && (
                    <EditAmenda
                        id={editId}
                        onSaveSuccess={handleEditSuccess}
                        onCancel={handleCloseEdit}
                    />
                )}
            </Modal>
        </div>
    );
};

export default AmenziPage;