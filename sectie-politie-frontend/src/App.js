import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster, toast, useToasterStore, ToastBar } from "react-hot-toast"; // Importam ToastBar
import { useEffect } from 'react';
import Menu from './components/Menu';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PolitistiPage from './pages/PolitistiPage';
import ProtectedRoute from './components/ProtectedRoute';
import EditPolitist from "./components/EditPolitist";
import StatisticiPage from './pages/StatisticiPage'
import IncidentePage from "./pages/IncidentePage";
import PersoanePage from "./pages/PersoanePage";
import AdresePage from "./pages/AdresePage";
import AmenziPage from "./pages/AmenziPage";
import HomePage from './pages/HomePage';
import './components/styles/Toast.css'

function App() {
    // --- LOGICA PENTRU LIMITARE LA 3 TOAST-URI ---
    const { toasts } = useToasterStore();
    const TOAST_LIMIT = 3;

    useEffect(() => {
        toasts
            .filter((t) => t.visible) // Doar cele vizibile
            .filter((_, i) => i >= TOAST_LIMIT) // Tot ce depaseste limita de 3
            .forEach((t) => toast.dismiss(t.id)); // Le inchidem
    }, [toasts]);

    return (
        <BrowserRouter>
            {/* Configurarea Toast-urilor */}
            <Toaster
                position="top-right"
                reverseOrder={false}
                gutter={10}
                containerStyle={{
                    top: 20,
                    right: 20,
                }}
                toastOptions={{
                    // Păstrăm clasele tale originale pentru design-ul vechi
                    className: 'toast-base',
                    success: {
                        className: 'toast-base toast-success',
                        duration: 3000,
                        iconTheme: { primary: '#28a745', secondary: '#fff' },
                    },
                    error: {
                        className: 'toast-base toast-error',
                        duration: 4000,
                        iconTheme: { primary: '#dc3545', secondary: '#fff' },
                    },
                    loading: { className: 'toast-base toast-loading' }
                }}
            >
                {(t) => (
                    // Folosim ToastBar pentru a pastra design-ul original al librariei (animatii, stiluri)
                    // dar injectam butonul nostru
                    <ToastBar toast={t}>
                        {({ icon, message }) => (
                            <>
                                {/* Iconita standard (cea veche) */}
                                {icon}

                                {/* Mesajul notificarii */}
                                <div style={{ margin: '0 10px', flex: 1 }}>
                                    {message}
                                </div>

                                {/* Butonul X - apare doar daca nu e loading */}
                                {t.type !== 'loading' && (
                                    <button
                                        className="toast-close-btn"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Oprim propagarea click-ului
                                            toast.dismiss(t.id);
                                        }}
                                    >
                                        ✕
                                    </button>
                                )}
                            </>
                        )}
                    </ToastBar>
                )}
            </Toaster>

            <Routes>
                <Route path="/" element={<Menu />}>
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register" element={<RegisterPage />} />
                    <Route index element={<LoginPage />} />

                    <Route element={<ProtectedRoute />}>
                        <Route path="acasa" element={<HomePage />} />
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