/**
 * Wrapper component for protected routes.
 * I check if the user exists in the context; if not, I redirect to Login.
 * @author Ivan Vlad-Daniel
 * @version January 11, 2026
 */
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const { user } = useAuth();

    if (!user) {
        // If I am not logged in, I redirect back to the login page.
        return <Navigate to="/login" replace />;
    }

    // If I am logged in, I render the child route content (Outlet).
    return <Outlet />;
};

export default ProtectedRoute;