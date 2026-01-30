/**
 * Main page for managing Fines.
 * Includes "Boomerang" logic for returning from delete conflicts.
 * @author Ivan Vlad-Daniel
 * @version January 11, 2026
 */
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

    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [highlightId, setHighlightId] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();

    // 1. I check if I was sent here to resolve a conflict (Boomerang effect).
    useEffect(() => {
        if (location.state && location.state.openEditId) {
            setEditId(location.state.openEditId);
            setIsEditModalOpen(true);
        }
    }, [location]);

    // Universal closing function (handles returning to the original page).
    const handleCloseOrFinish = () => {
        // I check if there is a pending action in session storage.
        const boomerang = sessionStorage.getItem('boomerang_pending');
        if (boomerang) {
            const data = JSON.parse(boomerang);
            if (data.returnRoute) {
                // I navigate back to the page that triggered the conflict (e.g., PolitistiPage).
                navigate(data.returnRoute);
                return;
            }
        }

        // Standard behavior.
        setIsEditModalOpen(false);
        setEditId(null);
        // I clear the history state to prevent reopening the modal on refresh.
        window.history.replaceState({}, document.title);
    };

    const handleAddSuccess = (newId) => {
        setIsAddModalOpen(false);
        setHighlightId(newId);
        setRefreshTrigger(prev => prev + 1);
    };

    const handleEditSuccess = (savedId) => {
        const boomerang = sessionStorage.getItem('boomerang_pending');

        if (boomerang) {
            // If I resolved the conflict, I return immediately.
            const data = JSON.parse(boomerang);
            navigate(data.returnRoute);
        } else {
            // If it's a normal edit, I stay here and refresh the list.
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

            {/* I use handleCloseOrFinish to ensure correct navigation flow. */}
            <Modal isOpen={isEditModalOpen} onClose={handleCloseOrFinish} title="Editați Amendă">
                {editId && <EditAmenda id={editId} onSaveSuccess={handleEditSuccess} onCancel={handleCloseOrFinish} />}
            </Modal>
        </div>
    );
};

export default AmenziPage;