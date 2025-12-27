// src/App.js
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Menu from './components/Menu';
import LoginPage from './pages/LoginPage';
import PolitistiPage from './pages/PolitistiPage';
import ProtectedRoute from './components/ProtectedRoute'; // 1. Importăm paznicul
import EditPolitist from "./components/EditPolitist";
import StatisticiPage from './pages/StatisticiPage'
import IncidentePage from "./pages/IncidentePage";
import PersoanePage from "./pages/PersoanePage";
import AdresePage from "./pages/AdresePage";
import AmenziPage from "./pages/AmenziPage";


function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Meniul se încarcă mereu */}
                <Route path="/" element={<Menu />}>

                    {/* Rutele Publice */}
                    <Route path="login" element={<LoginPage />} />
                    <Route index element={<LoginPage />} />

                    {/* Rutele Private (Protejate) */}
                    <Route element={<ProtectedRoute />}>
                        {/* Tot ce e aici e păzit. Doar logații ajung. */}
                        <Route path="politisti" element={<PolitistiPage />} />
                        <Route path="politisti/edit/:id" element={<EditPolitist />} />
                        <Route path="/statistici" element={<StatisticiPage />} />
                        <Route path="incidente" element={<IncidentePage />} />
                        <Route path="persoane" element={<PersoanePage />} />
                        <Route path="amenzi" element={<AmenziPage />} />
                        <Route path="adrese" element={<AdresePage />} />
                    </Route>

                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;