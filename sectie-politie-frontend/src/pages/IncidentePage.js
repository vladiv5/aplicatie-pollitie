import React from 'react';
import IncidenteList from '../components/IncidenteList';
import AddIncident from "../components/AddIncident";
import Modal from "../components/Modal";
import { useState } from "react";

const IncidentePage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <div>
            <IncidenteList
                key={refreshKey}
                onAddClick={() => setIsModalOpen(true)} // Butonul verde deschide modalul
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adaugă Incident Nou">
                <AddIncident
                    onSaveSuccess={() => {
                        setIsModalOpen(false);
                        setRefreshKey(k => k + 1);
                        alert("Incident adăugat!");
                    }}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
};
export default IncidentePage;