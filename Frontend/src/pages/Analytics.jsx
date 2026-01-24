import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { AnalyticsContent } from '../components/dashboard/AnalyticsContent';

export function Analytics() {
    return (
        <DashboardLayout>
            <div className="p-6 max-w-7xl mx-auto">
                <AnalyticsContent />
            </div>
        </DashboardLayout>
    );
}
