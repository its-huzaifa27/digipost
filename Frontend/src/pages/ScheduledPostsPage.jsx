import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ScheduledPosts } from '../components/dashboard/ScheduledPosts';

export function ScheduledPostsPage() {
    return (
        <DashboardLayout>
            <section className="bg-[#f3f4f6] min-h-screen p-4 md:p-8">
                <ScheduledPosts />
            </section>
        </DashboardLayout>
    );
}
