import React, { useState } from 'react';
import AdreseList from '../components/AdreseList';
import AddAdresa from '../components/AddAdresa';
import EditAdresa from '../components/EditAdresa';
import ViewLocatariAdresa from '../components/ViewLocatariAdresa';
import Modal from '../components/Modal';

const AdresePage = () => {
    // --- STATE MODALE ---
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [locatariAdresaId, setLocatariAdresaId] = useState(null); // ID pt vizualizare locatari
    const [editId, setEditId] = useState(null);

    // --- REFRESH ---
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleAddSuccess = () => {
        setIsAddModalOpen(false);
        setRefreshTrigger(prev => prev + 1);
        alert("Adresă adăugată cu succes!");
    };

    const handleEditSuccess = () => {
        setIsEditModalOpen(false);
        setEditId(null);
        setRefreshTrigger(prev => prev + 1);
        alert("Adresă modificată cu succes!");
    };

    return (
        <div>
            {/* Lista inteligenta */}
            <AdreseList
                refreshTrigger={refreshTrigger}
                onAddClick={() => setIsAddModalOpen(true)}
                onEditClick={(id) => { setEditId(id); setIsEditModalOpen(true); }}
                onViewLocatariClick={(id) => setLocatariAdresaId(id)}
            />

            {/* MODAL ADD */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Adaugă Adresă">
                <AddAdresa onSaveSuccess={handleAddSuccess} onCancel={() => setIsAddModalOpen(false)} />
            </Modal>

            {/* MODAL EDIT */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editează Adresă">
                {editId && (
                    <EditAdresa id={editId} onSaveSuccess={handleEditSuccess} onCancel={() => setIsEditModalOpen(false)} />
                )}
            </Modal>

            {/* MODAL LOCATARI */}
            <Modal isOpen={!!locatariAdresaId} onClose={() => setLocatariAdresaId(null)} title="Locatari la această adresă">
                {locatariAdresaId && (
                    <ViewLocatariAdresa
                        adresaId={locatariAdresaId}
                        onClose={() => setLocatariAdresaId(null)}
                    />
                )}
            </Modal>
        </div>
    );
};

export default AdresePage;