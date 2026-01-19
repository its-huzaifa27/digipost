import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');

    const isTokenExpired = (token) => {
        if (!token) return true;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 < Date.now();
        } catch (e) {
            return true;
        }
    };

    if (!token || isTokenExpired(token)) {
        // Clear invalid token and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return <Navigate to="/login" replace />;
    }

    // Render children (or Outlet) if authenticated
    return children ? children : <Outlet />;
};
