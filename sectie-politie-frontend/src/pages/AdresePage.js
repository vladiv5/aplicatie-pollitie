import toast from 'react-hot-toast';
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
    const [locatariAdresaId, setLocatariAdresaId] = useState(null);
    const [editId, setEditId] = useState(null);

    // --- REFRESH & HIGHLIGHT ---
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
        <div>
            {/* Lista inteligenta */}
            <AdreseList
                refreshTrigger={refreshTrigger}
                onAddClick={() => setIsAddModalOpen(true)}
                onEditClick={(id) => { setEditId(id); setIsEditModalOpen(true); }}
                onViewLocatariClick={(id) => setLocatariAdresaId(id)}

                // Highlight props
                highlightId={highlightId}
                onHighlightComplete={() => setHighlightId(null)}
                setHighlightId={setHighlightId} // <--- IMPORTANT
            />

            {/* MODALE */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Adăugați Adresă">
                <AddAdresa onSaveSuccess={handleAddSuccess} onCancel={() => setIsAddModalOpen(false)} />
            </Modal>

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editați Adresă">
                {editId && (
                    <EditAdresa id={editId} onSaveSuccess={handleEditSuccess} onCancel={() => setIsEditModalOpen(false)} />
                )}
            </Modal>

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