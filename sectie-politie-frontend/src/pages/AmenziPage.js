import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AmenziList from '../components/AmenziList';
import AddAmenda from '../components/AddAmenda';
import EditAmenda from '../components/EditAmenda';
import Modal from '../components/Modal';

const AmenziPage = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);

    // REFRESH & HIGHLIGHT
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [highlightId, setHighlightId] = useState(null); // <--- STATE NOU

    const location = useLocation();
    const navigate = useNavigate();

    // 1. JUMP IN
    useEffect(() => {
        if (location.state && location.state.openEditId) {
            setEditId(location.state.openEditId);
            setIsEditModalOpen(true);
        }
    }, [location]);

    // 2. JUMP OUT
    const handleCloseOrFinish = () => {
        setIsEditModalOpen(false);
        setEditId(null);
        if (location.state && location.state.returnTo) {
            navigate(location.state.returnTo, {
                state: {
                    triggerAction: location.state.returnAction,
                    triggerId: location.state.returnId
                }
            });
        } else {
            window.history.replaceState({}, document.title);
        }
    };

    const handleAddSuccess = (newId) => { // Primim ID
        setIsAddModalOpen(false);
        setHighlightId(newId); // Setam Focus
        setRefreshTrigger(prev => prev + 1);
    };

    const handleEditSuccess = (savedId) => { // Primim ID
        setRefreshTrigger(prev => prev + 1);
        setHighlightId(savedId); // Setam Focus
        handleCloseOrFinish();
    };

    return (
        <div>
            <AmenziList
                refreshTrigger={refreshTrigger}
                onAddClick={() => setIsAddModalOpen(true)}
                onEditClick={(id) => { setEditId(id); setIsEditModalOpen(true); }}
                // PROPS NOI
                highlightId={highlightId}
                onHighlightComplete={() => setHighlightId(null)}
            />

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Adăugați Amendă Nouă">
                <AddAmenda onSaveSuccess={handleAddSuccess} onCancel={() => setIsAddModalOpen(false)} />
            </Modal>

            <Modal isOpen={isEditModalOpen} onClose={handleCloseOrFinish} title="Editați Amendă">
                {editId && <EditAmenda id={editId} onSaveSuccess={handleEditSuccess} onCancel={handleCloseOrFinish} />}
            </Modal>
        </div>
    );
};

export default AmenziPage;