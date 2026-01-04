import React, { useState } from 'react';
import PersoaneList from '../components/PersoaneList';
import AddPersoana from '../components/AddPersoana';
import EditPersoana from '../components/EditPersoana';
import ViewIncidentePersoana from '../components/ViewIncidentePersoana';
import ViewAdresePersoana from '../components/ViewAdresePersoana';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const PersoanePage = () => {
    // State Modale
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [historyId, setHistoryId] = useState(null);
    const [adreseId, setAdreseId] = useState(null);
    const [editId, setEditId] = useState(null);

    // Refresh Trigger
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleAddSuccess = () => {
        setIsAddModalOpen(false);
        setRefreshTrigger(prev => prev + 1);
    };

    const handleEditSuccess = () => {
        setIsEditModalOpen(false);
        setEditId(null);
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div>
            {/* Lista inteligenta */}
            <PersoaneList
                refreshTrigger={refreshTrigger}
                onAddClick={() => setIsAddModalOpen(true)}
                onEditClick={(id) => { setEditId(id); setIsEditModalOpen(true); }}
                onViewHistoryClick={(id) => setHistoryId(id)}
                onViewAdreseClick={(id) => setAdreseId(id)}
            />

            {/* MODALE */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Adaugă Persoană">
                <AddPersoana onSaveSuccess={handleAddSuccess} onCancel={() => setIsAddModalOpen(false)} />
            </Modal>

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editează Persoană">
                {editId && <EditPersoana id={editId} onSaveSuccess={handleEditSuccess} onCancel={() => setIsEditModalOpen(false)} />}
            </Modal>

            <Modal isOpen={!!historyId} onClose={() => setHistoryId(null)} title="Istoric Incidente">
                {historyId && <ViewIncidentePersoana persoanaId={historyId} onClose={() => setHistoryId(null)} />}
            </Modal>

            <Modal isOpen={!!adreseId} onClose={() => setAdreseId(null)} title="Adrese Asociate">
                {adreseId && <ViewAdresePersoana persoanaId={adreseId} onClose={() => setAdreseId(null)} />}
            </Modal>
        </div>
    );
};

export default PersoanePage;