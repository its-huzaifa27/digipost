import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';

export function CreatePost() {
    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold text-gray-900">Create New Post</h1>
                    <p className="text-gray-500">Draft and schedule your content across multiple platforms.</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                    <div className="text-gray-400 mb-4">Content creation form coming soon...</div>
                </div>
            </div>
        </DashboardLayout>
    );
}
