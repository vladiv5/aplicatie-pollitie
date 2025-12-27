import React, { useState } from 'react';
import AmenziList from '../components/AmenziList';
import AddAmenda from '../components/AddAmenda';
import Modal from '../components/Modal';

const AmenziPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <div>
            <AmenziList
                key={refreshKey}
                onAddClick={() => setIsModalOpen(true)}
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adaugă Amendă Nouă">
                <AddAmenda
                    onSaveSuccess={() => {
                        setIsModalOpen(false);
                        setRefreshKey(k => k + 1); // Refresh la listă
                        alert("Amendă adăugată cu succes!");
                    }}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
};

export default AmenziPage;