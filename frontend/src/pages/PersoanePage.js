/** Pagina principala pentru gestionarea Persoanelor
 * Integreaza lista, modalele de adaugare/editare si vizualizarea istoricului
 * @author Ivan Vlad-Daniel
 * @version 11 ianuarie 2026
 */
import React, { useState } from 'react';
import PersoaneList from '../components/PersoaneList';
import AddPersoana from '../components/AddPersoana';
import EditPersoana from '../components/EditPersoana';
import ViewIncidentePersoana from '../components/ViewIncidentePersoana';
import ViewAdresePersoana from '../components/ViewAdresePersoana';
import Modal from '../components/Modal';

const PersoanePage = () => {
    // --- State Modale ---
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [historyId, setHistoryId] = useState(null);
    const [adreseId, setAdreseId] = useState(null);
    const [editId, setEditId] = useState(null);

    // --- State Refresh & Highlight ---
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [highlightId, setHighlightId] = useState(null);

    const handleAddSuccess = (newId) => {
        setIsAddModalOpen(false);
        setHighlightId(newId);
        setRefreshTrigger(prev => prev + 1);
    };

    const handleEditSuccess = (savedId) => {
        setIsEditModalOpen(false);
        setEditId(null);
        setHighlightId(savedId);
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="page-wrapper">
            <PersoaneList
                refreshTrigger={refreshTrigger}
                onAddClick={() => setIsAddModalOpen(true)}
                onEditClick={(id) => { setEditId(id); setIsEditModalOpen(true); }}
                onViewHistoryClick={(id) => setHistoryId(id)}
                onViewAdreseClick={(id) => setAdreseId(id)}

                highlightId={highlightId}
                onHighlightComplete={() => setHighlightId(null)}
                // IMPORTANT: Trimit setter-ul pentru Bumerang logic (revenire dupa stergere)
                setHighlightId={setHighlightId}
            />

            {/* --- Modale --- */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Adăugați Persoană">
                <AddPersoana onSaveSuccess={handleAddSuccess} onCancel={() => setIsAddModalOpen(false)} />
            </Modal>

            <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditId(null); }} title="Editați Persoană">
                {editId && (
                    <EditPersoana
                        id={editId}
                        onSaveSuccess={handleEditSuccess}
                        onCancel={() => { setIsEditModalOpen(false); setEditId(null); }}
                    />
                )}
            </Modal>

            <Modal isOpen={!!historyId} onClose={() => setHistoryId(null)} title="Istoric Incidente" maxWidth="800px">
                {historyId && <ViewIncidentePersoana persoanaId={historyId} onClose={() => setHistoryId(null)} />}
            </Modal>

            <Modal isOpen={!!adreseId} onClose={() => setAdreseId(null)} title="Adrese Asociate">
                {adreseId && <ViewAdresePersoana persoanaId={adreseId} onClose={() => setAdreseId(null)} />}
            </Modal>
        </div>
    );
};

export default PersoanePage;