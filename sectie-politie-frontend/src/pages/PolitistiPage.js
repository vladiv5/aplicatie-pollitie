import React, { useState } from "react";
import PolitistiList from '../components/PolitistiList';
import AddPolitist from "../components/AddPolitist";
import Modal from "../components/Modal"; // Importăm Modalul Generic

const PolitistiPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0); // Un truc pentru a reîncărca lista după adăugare

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleSaveSuccess = () => {
        setIsModalOpen(false); // Închidem modalul
        setRefreshKey(prev => prev + 1); // Forțăm reîncărcarea listei
        alert("Polițist adăugat cu succes!");
    };

    return (
        <div>
            {/* Trimitem funcția handleOpenModal către listă */}
            <PolitistiList
                key={refreshKey} // Când se schimbă cheia, lista se reîncarcă
                onAddClick={handleOpenModal}
            />

            {/* Fereastra Modală care conține Formularul */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Adaugă Polițist Nou">
                <AddPolitist
                    onSaveSuccess={handleSaveSuccess}
                    onCancel={handleCloseModal}
                />
            </Modal>
        </div>
    );
};

export default PolitistiPage;