/**
 * Main page for managing Addresses.
 * Integrates the list view, add/edit modals, and resident viewing.
 * @author Ivan Vlad-Daniel
 * @version January 11, 2026
 */
import React, { useState } from 'react';
import AdreseList from '../components/AdreseList';
import AddAdresa from '../components/AddAdresa';
import EditAdresa from '../components/EditAdresa';
import ViewLocatariAdresa from '../components/ViewLocatariAdresa';
import Modal from '../components/Modal';

const AdresePage = () => {
    // --- Modal State ---
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [locatariAdresaId, setLocatariAdresaId] = useState(null);
    const [editId, setEditId] = useState(null);

    // --- Refresh and Highlight State ---
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [highlightId, setHighlightId] = useState(null);

    // I handle the successful addition of a new address.
    const handleAddSuccess = (newId) => {
        setIsAddModalOpen(false);
        setHighlightId(newId); // I activate the row highlight effect.
        setRefreshTrigger(prev => prev + 1); // I force the list to reload.
    };

    // I handle the successful update of an existing address.
    const handleEditSuccess = (savedId) => {
        setIsEditModalOpen(false);
        setEditId(null);
        setHighlightId(savedId);
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div>
            {/* Smart List Component */}
            <AdreseList
                refreshTrigger={refreshTrigger}
                onAddClick={() => setIsAddModalOpen(true)}
                onEditClick={(id) => { setEditId(id); setIsEditModalOpen(true); }}
                onViewLocatariClick={(id) => setLocatariAdresaId(id)}

                // I pass props for the highlight and boomerang system down to the list.
                highlightId={highlightId}
                onHighlightComplete={() => setHighlightId(null)}
                setHighlightId={setHighlightId}
            />

            {/* --- MODALS --- */}
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