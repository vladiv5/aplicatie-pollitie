import React, { useState } from 'react';
import PersoaneList from '../components/PersoaneList';
import AddPersoana from '../components/AddPersoana';
import Modal from '../components/Modal';

const PersoanePage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <div>
            <PersoaneList
                key={refreshKey}
                onAddClick={() => setIsModalOpen(true)}
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adaugă Persoană Nouă">
                <AddPersoana
                    onSaveSuccess={() => {
                        setIsModalOpen(false);
                        setRefreshKey(k => k + 1); // Reîncărcăm lista
                        alert("Persoană adăugată cu succes!");
                    }}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
};

export default PersoanePage;