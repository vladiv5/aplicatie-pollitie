import React, { useState } from 'react';
import PersoaneList from '../components/PersoaneList';
import AddPersoana from '../components/AddPersoana';
import EditPersoana from '../components/EditPersoana'; // Importam componenta noua
import Modal from '../components/Modal';

const PersoanePage = () => {
    // --- STATE PENTRU ADAUGARE ---
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // --- STATE PENTRU EDITARE (Nou) ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);

    // --- REFRESH LISTA ---
    const [refreshKey, setRefreshKey] = useState(0);

    // -- Handlers Adaugare --
    const handleOpenAdd = () => setIsAddModalOpen(true);
    const handleCloseAdd = () => setIsAddModalOpen(false);

    const handleAddSuccess = () => {
        setIsAddModalOpen(false);
        setRefreshKey(prev => prev + 1);
        alert("Persoană adăugată cu succes!");
    };

    // -- Handlers Editare (Sablonul) --
    const handleOpenEdit = (id) => {
        setEditId(id);
        setIsEditModalOpen(true);
    };

    const handleCloseEdit = () => {
        setEditId(null);
        setIsEditModalOpen(false);
    };

    const handleEditSuccess = () => {
        setIsEditModalOpen(false);
        setEditId(null);
        setRefreshKey(prev => prev + 1); // Fortam reincarcarea listei
        alert("Datele persoanei au fost actualizate!");
    };

    return (
        <div>
            {/* Lista primeste acum si functia de editare */}
            <PersoaneList
                key={refreshKey}
                onAddClick={handleOpenAdd}
                onEditClick={handleOpenEdit}
            />

            {/* Modal Adaugare */}
            <Modal isOpen={isAddModalOpen} onClose={handleCloseAdd} title="Adaugă Persoană Nouă">
                <AddPersoana
                    onSaveSuccess={handleAddSuccess}
                    onCancel={handleCloseAdd}
                />
            </Modal>

            {/* Modal Editare (Nou) */}
            <Modal isOpen={isEditModalOpen} onClose={handleCloseEdit} title="Editează Persoană">
                {editId && (
                    <EditPersoana
                        id={editId}
                        onSaveSuccess={handleEditSuccess}
                        onCancel={handleCloseEdit}
                    />
                )}
            </Modal>
        </div>
    );
};

export default PersoanePage;