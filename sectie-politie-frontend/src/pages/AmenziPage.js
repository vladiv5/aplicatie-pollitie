import React, { useState } from 'react';
import AmenziList from '../components/AmenziList';
import AddAmenda from '../components/AddAmenda';
import EditAmenda from '../components/EditAmenda';
import Modal from '../components/Modal';

const AmenziPage = () => {
    // --- STATE MODALE ---
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);

    // --- REFRESH ---
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleAddSuccess = () => {
        setIsAddModalOpen(false);
        setRefreshTrigger(prev => prev + 1);
        alert("Amendă adăugată cu succes!");
    };

    const handleEditSuccess = () => {
        setIsEditModalOpen(false);
        setEditId(null);
        setRefreshTrigger(prev => prev + 1);
        alert("Amendă modificată cu succes!");
    };

    return (
        <div>
            {/* Lista inteligenta */}
            <AmenziList
                refreshTrigger={refreshTrigger}
                onAddClick={() => setIsAddModalOpen(true)}
                onEditClick={(id) => { setEditId(id); setIsEditModalOpen(true); }}
            />

            {/* MODAL ADD */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Adaugă Amendă Nouă">
                <AddAmenda
                    onSaveSuccess={handleAddSuccess}
                    onCancel={() => setIsAddModalOpen(false)}
                />
            </Modal>

            {/* MODAL EDIT */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editează Amendă">
                {editId && (
                    <EditAmenda
                        id={editId}
                        onSaveSuccess={handleEditSuccess}
                        onCancel={() => setIsEditModalOpen(false)}
                    />
                )}
            </Modal>
        </div>
    );
};

export default AmenziPage;