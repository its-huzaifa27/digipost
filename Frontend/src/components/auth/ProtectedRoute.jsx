import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = ({ children }) => {
    const user = localStorage.getItem('user');

    if (!user) {
        // Redirect if no user data found
        return <Navigate to="/login" replace />;
    }

    // Render children (or Outlet) if authenticated
    return children ? children : <Outlet />;
};
