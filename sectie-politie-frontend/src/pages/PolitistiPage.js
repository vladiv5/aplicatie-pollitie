import React from "react";
import PolitistiList from '../components/PolitistiList'; // Importăm componenta noastră
import AddPolitist from "../components/AddPolitist";

const PolitistiPage = () => {
    return (
        <div style={{ padding: '20px' }}>
            <AddPolitist />
            <PolitistiList />
        </div>
    );
};

export default PolitistiPage;