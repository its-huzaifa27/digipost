import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../dashboard/Sidebar';

export function DashboardLayout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const selectedClient = localStorage.getItem('selectedClient');
        // Allow access to /clients without selection to enable creating new clients
        // Also allow access if we are already on the selection page (though this layout shouldn't be used there)
        if (!selectedClient && location.pathname !== '/clients') {
            navigate('/select-client');
        }
    }, [navigate, location]);

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Sidebar />
            <main className="flex-1 ml-56 flex flex-col min-w-0">
                {children}
            </main>
        </div>
    );
}
