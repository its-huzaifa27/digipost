import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');

    if (!token) {
        // Redirect to login if no token is found
        return <Navigate to="/login" replace />;
    }

    // Render children (or Outlet) if authenticated
    return children ? children : <Outlet />;
};
