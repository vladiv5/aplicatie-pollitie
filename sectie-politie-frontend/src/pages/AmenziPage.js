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
    const [highlightId, setHighlightId] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();

    // 1. JUMP IN
    useEffect(() => {
        if (location.state && location.state.openEditId) {
            setEditId(location.state.openEditId);
            setIsEditModalOpen(true);
        }
    }, [location]);

    // 2. CLOSE HANDLER
    const handleCloseOrFinish = () => {
        setIsEditModalOpen(false);
        setEditId(null);
        window.history.replaceState({}, document.title);
    };

    const handleAddSuccess = (newId) => {
        setIsAddModalOpen(false);
        setHighlightId(newId);
        setRefreshTrigger(prev => prev + 1);
    };

    // --- MODIFICARE CRITICĂ AICI ---
    const handleEditSuccess = (savedId) => {
        // Verificăm dacă avem bilet de întoarcere
        const boomerang = sessionStorage.getItem('boomerang_pending');

        if (boomerang) {
            const data = JSON.parse(boomerang);
            // Dacă există, plecăm înapoi la sursă (ex: /politisti)
            navigate(data.returnRoute);
        } else {
            // Comportament normal
            setRefreshTrigger(prev => prev + 1);
            setHighlightId(savedId);
            handleCloseOrFinish();
        }
    };

    return (
        <div>
            <AmenziList
                refreshTrigger={refreshTrigger}
                onAddClick={() => setIsAddModalOpen(true)}
                onEditClick={(id) => { setEditId(id); setIsEditModalOpen(true); }}

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