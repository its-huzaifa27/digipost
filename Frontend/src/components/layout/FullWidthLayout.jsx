import React from 'react';
import { Sidebar } from '../dashboard/Sidebar'; // Keep sidebar available if we need to restore it or use it as the drawer content later?
// Actually, for "Full Width", we just want the content area.

export function FullWidthLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col min-w-0">
            {/* No Sidebar */}
            <main className="flex-1 flex flex-col min-w-0">
                {children}
            </main>
        </div>
    );
}
