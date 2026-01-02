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

    const location = useLocation();
    const navigate = useNavigate();

    // 1. JUMP IN
    useEffect(() => {
        if (location.state && location.state.openEditId) {
            setEditId(location.state.openEditId);
            setIsEditModalOpen(true);
            // NU stergem state-ul
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

    const handleAddSuccess = () => { setIsAddModalOpen(false); setRefreshTrigger(prev => prev + 1); alert("Amendă adăugată!"); };

    const handleEditSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
        alert("Amendă modificată!");
        handleCloseOrFinish();
    };

    return (
        <div>
            <AmenziList
                refreshTrigger={refreshTrigger}
                onAddClick={() => setIsAddModalOpen(true)}
                onEditClick={(id) => { setEditId(id); setIsEditModalOpen(true); }}
            />
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Adaugă Amendă Nouă">
                <AddAmenda onSaveSuccess={handleAddSuccess} onCancel={() => setIsAddModalOpen(false)} />
            </Modal>

            {/* Navigare inteligenta pe Close si Cancel */}
            <Modal isOpen={isEditModalOpen} onClose={handleCloseOrFinish} title="Editează Amendă">
                {editId && <EditAmenda id={editId} onSaveSuccess={handleEditSuccess} onCancel={handleCloseOrFinish} />}
            </Modal>
        </div>
    );
};

export default AmenziPage;