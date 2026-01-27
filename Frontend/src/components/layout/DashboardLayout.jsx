import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../dashboard/Sidebar';
import { FaBars } from 'react-icons/fa6';

export function DashboardLayout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const selectedClient = localStorage.getItem('selectedClient');
        // Allow access to /clients without selection to enable creating new clients
        // Also allow access if we are already on the selection page (though this layout shouldn't be used there)
        if (!selectedClient && location.pathname !== '/clients') {
            navigate('/select-client');
        }
    }, [navigate, location]);

    // Close sidebar on route change
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Mobile Header for Sidebar Toggle */}
            <div className="md:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-30">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                    <FaBars className="w-6 h-6" />
                </button>
                <span className="font-bold text-lg text-gray-900">Publixy</span>
                <div className="w-8"></div> {/* Spacer for centering if needed */}
            </div>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <main className="flex-1 md:ml-48 flex flex-col min-w-0 transition-all duration-300">
                {children}
            </main>
        </div>
    );
}
