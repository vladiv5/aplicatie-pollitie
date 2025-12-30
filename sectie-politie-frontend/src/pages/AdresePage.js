import React, { useState } from 'react';
import AdreseList from '../components/AdreseList';
import AddAdresa from '../components/AddAdresa';
import EditAdresa from '../components/EditAdresa';
// 1. Importam componenta noua
import ViewLocatariAdresa from '../components/ViewLocatariAdresa';
import Modal from '../components/Modal';

const AdresePage = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // 2. State pentru ID-ul adresei la care vedem locatarii
    const [locatariAdresaId, setLocatariAdresaId] = useState(null);

    const [editId, setEditId] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleAddSuccess = () => {
        setIsAddModalOpen(false);
        setRefreshKey(k => k + 1);
        alert("Adresă adăugată cu succes!");
    };

    const handleEditSuccess = () => {
        setIsEditModalOpen(false);
        setEditId(null);
        setRefreshKey(k => k + 1);
        alert("Adresă modificată cu succes!");
    };

    return (
        <div>
            <AdreseList
                key={refreshKey}
                onAddClick={() => setIsAddModalOpen(true)}
                onEditClick={(id) => { setEditId(id); setIsEditModalOpen(true); }}
                // 3. Trimitem functia
                onViewLocatariClick={(id) => setLocatariAdresaId(id)}
            />

            {/* Modal Add */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Adaugă Adresă">
                <AddAdresa onSaveSuccess={handleAddSuccess} onCancel={() => setIsAddModalOpen(false)} />
            </Modal>

            {/* Modal Edit */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editează Adresă">
                {editId && (
                    <EditAdresa id={editId} onSaveSuccess={handleEditSuccess} onCancel={() => setIsEditModalOpen(false)} />
                )}
            </Modal>

            {/* 4. Modal NOU: Locatari */}
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