// src/components/ProtectedRoute.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const { user } = useAuth(); // Verificăm în memoria globală dacă suntem logați

    if (!user) {
        // Dacă NU sunt logaț, întoarcere la pagina de login
        return <Navigate to="/login" replace />;
    }

    // Dacă SUNT logați, arată pagina cerută (ex: PolitistiPage)
    return <Outlet />;
};

export default ProtectedRoute;