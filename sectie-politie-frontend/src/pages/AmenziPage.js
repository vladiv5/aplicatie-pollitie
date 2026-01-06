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

    // --- MODIFICARE AICI: Logica Bumerang pe X / Anuleaza ---
    const handleCloseOrFinish = () => {
        // 1. Verificam Bumerangul
        const boomerang = sessionStorage.getItem('boomerang_pending');
        if (boomerang) {
            const data = JSON.parse(boomerang);
            if (data.returnRoute) {
                // Ne intoarcem la PolitistiPage
                navigate(data.returnRoute);
                return; // STOP AICI
            }
        }

        // 2. Comportament Normal
        setIsEditModalOpen(false);
        setEditId(null);
        window.history.replaceState({}, document.title);
    };

    const handleAddSuccess = (newId) => {
        setIsAddModalOpen(false);
        setHighlightId(newId);
        setRefreshTrigger(prev => prev + 1);
    };

    // --- MODIFICARE AICI: Logica Bumerang pe SAVE ---
    const handleEditSuccess = (savedId) => {
        const boomerang = sessionStorage.getItem('boomerang_pending');

        if (boomerang) {
            const data = JSON.parse(boomerang);
            navigate(data.returnRoute); // Plecam inapoi
        } else {
            // Ramanem aici
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

            {/* AICI FOLOSIM handleCloseOrFinish LA AMBELE EVENT-URI */}
            <Modal isOpen={isEditModalOpen} onClose={handleCloseOrFinish} title="Editați Amendă">
                {editId && <EditAmenda id={editId} onSaveSuccess={handleEditSuccess} onCancel={handleCloseOrFinish} />}
            </Modal>
        </div>
    );
};

export default AmenziPage;