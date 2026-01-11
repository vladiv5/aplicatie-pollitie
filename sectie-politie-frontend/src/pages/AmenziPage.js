/** Pagina principala pentru gestionarea Amenzilor
 * Include logica "Bumerang" pentru intoarcerea din conflicte de stergere
 * @author Ivan Vlad-Daniel
 * @version 11 ianuarie 2026
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

    // 1. Verific daca am fost trimis aici pentru a rezolva un conflict (Bumerang)
    useEffect(() => {
        if (location.state && location.state.openEditId) {
            setEditId(location.state.openEditId);
            setIsEditModalOpen(true);
        }
    }, [location]);

    // Functie universala de inchidere (gestioneaza revenirea la pagina originala)
    const handleCloseOrFinish = () => {
        // Verific daca exista o actiune in asteptare
        const boomerang = sessionStorage.getItem('boomerang_pending');
        if (boomerang) {
            const data = JSON.parse(boomerang);
            if (data.returnRoute) {
                // Ma intorc la pagina care a declansat conflictul (ex: PolitistiPage)
                navigate(data.returnRoute);
                return;
            }
        }

        // Comportament normal
        setIsEditModalOpen(false);
        setEditId(null);
        // Curat state-ul din history pentru a nu redeschide modalul la refresh
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
            // Daca am rezolvat conflictul, ma intorc imediat
            const data = JSON.parse(boomerang);
            navigate(data.returnRoute);
        } else {
            // Daca e editare normala, raman aici si dau refresh
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

            {/* Folosesc handleCloseOrFinish pentru a asigura fluxul corect */}
            <Modal isOpen={isEditModalOpen} onClose={handleCloseOrFinish} title="Editați Amendă">
                {editId && <EditAmenda id={editId} onSaveSuccess={handleEditSuccess} onCancel={handleCloseOrFinish} />}
            </Modal>
        </div>
    );
};

export default AmenziPage;