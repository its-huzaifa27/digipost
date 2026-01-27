import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';

export function Help() {
    return (
        <DashboardLayout>
            <div className="p-8 max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Help Center</h1>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <section>
                        <h2 className="text-xl font-semibold mb-3">Getting Started</h2>
                        <p className="text-gray-600">Welcome to Digipost! To get started, connect your social media accounts in the Dashboard overview.</p>
                    </section>
                    <section>
                        <h2 className="text-xl font-semibold mb-3">Creating Posts</h2>
                        <p className="text-gray-600">Navigate to "Create Post" to draft content. You can use our AI Assistant to generate captions and images.</p>
                    </section>
                    <section>
                        <h2 className="text-xl font-semibold mb-3">Troubleshooting</h2>
                        <p className="text-gray-600">If you encounter issues, try refreshing the page or reconnecting your accounts in the settings.</p>
                    </section>
                    <div className="pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">Need more help? Contact support at support@digipost.com</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
