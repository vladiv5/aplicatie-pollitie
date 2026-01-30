/** Componenta Wrapper pentru rutele protejate
 * Verific daca exista user-ul in context; daca nu, redirectionez la Login
 * @author Ivan Vlad-Daniel
 * @version 11 ianuarie 2026
 */
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const { user } = useAuth();

    if (!user) {
        // Daca nu sunt logat, ma duc inapoi la login
        return <Navigate to="/login" replace />;
    }

    // Daca sunt logat, afisez continutul rutei copil (Outlet)
    return <Outlet />;
};

export default ProtectedRoute;