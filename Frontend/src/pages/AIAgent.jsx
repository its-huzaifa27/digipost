import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { AIAgentContent } from '../components/dashboard/AIAgentContent';

export function AIAgent() {
    return (
        <DashboardLayout>
            <div className="p-6 max-w-7xl mx-auto">
                <AIAgentContent />
            </div>
        </DashboardLayout>
    );
}
