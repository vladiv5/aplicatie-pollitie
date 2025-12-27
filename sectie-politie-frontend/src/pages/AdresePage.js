import React, { useState } from 'react';
import AdreseList from '../components/AdreseList';
import AddAdresa from '../components/AddAdresa';
import Modal from '../components/Modal';

const AdresePage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <div>
            <AdreseList
                key={refreshKey}
                onAddClick={() => setIsModalOpen(true)}
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adaugă Adresă Nouă">
                <AddAdresa
                    onSaveSuccess={() => {
                        setIsModalOpen(false);
                        setRefreshKey(k => k + 1); // Refresh la listă
                        alert("Adresă adăugată cu succes!");
                    }}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
};

export default AdresePage;