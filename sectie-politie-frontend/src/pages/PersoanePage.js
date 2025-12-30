import React, { useState } from 'react';
import PersoaneList from '../components/PersoaneList';
import AddPersoana from '../components/AddPersoana';
import EditPersoana from '../components/EditPersoana';
import ViewIncidentePersoana from '../components/ViewIncidentePersoana';
// 1. Importam noua componenta
import ViewAdresePersoana from '../components/ViewAdresePersoana';
import Modal from '../components/Modal';

const PersoanePage = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [historyId, setHistoryId] = useState(null);

    // 2. State nou pentru ID-ul persoanei la care vedem adresele
    const [adreseId, setAdreseId] = useState(null);

    const [editId, setEditId] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    // ... functiile handleAddSuccess, handleEditSuccess raman la fel ...
    const handleAddSuccess = () => {
        setIsAddModalOpen(false);
        setRefreshKey(k => k + 1);
        alert("Persoană adăugată cu succes!");
    };

    const handleEditSuccess = () => {
        setIsEditModalOpen(false);
        setEditId(null);
        setRefreshKey(k => k + 1);
        alert("Persoană modificată cu succes!");
    };

    return (
        <div>
            <PersoaneList
                key={refreshKey}
                onAddClick={() => setIsAddModalOpen(true)}
                onEditClick={(id) => { setEditId(id); setIsEditModalOpen(true); }}
                onViewHistoryClick={(id) => setHistoryId(id)}
                // 3. Trimitem functia
                onViewAdreseClick={(id) => setAdreseId(id)}
            />

            {/* ... Modal Add ... */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Adaugă Persoană">
                <AddPersoana onSaveSuccess={handleAddSuccess} onCancel={() => setIsAddModalOpen(false)} />
            </Modal>

            {/* ... Modal Edit ... */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editează Persoană">
                {editId && (
                    <EditPersoana id={editId} onSaveSuccess={handleEditSuccess} onCancel={() => setIsEditModalOpen(false)} />
                )}
            </Modal>

            {/* ... Modal Istoric ... */}
            <Modal isOpen={!!historyId} onClose={() => setHistoryId(null)} title="Istoric Incidente">
                {historyId && (
                    <ViewIncidentePersoana persoanaId={historyId} onClose={() => setHistoryId(null)} />
                )}
            </Modal>

            {/* 4. Modal NOU: Adrese */}
            <Modal isOpen={!!adreseId} onClose={() => setAdreseId(null)} title="Adrese Asociate">
                {adreseId && (
                    <ViewAdresePersoana
                        persoanaId={adreseId}
                        onClose={() => setAdreseId(null)}
                    />
                )}
            </Modal>
        </div>
    );
};

export default PersoanePage;