import React from 'react';
import { Sidebar } from '../dashboard/Sidebar';

export function DashboardLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Sidebar />
            <main className="flex-1 ml-56 flex flex-col min-w-0">
                {children}
            </main>
        </div>
    );
}
