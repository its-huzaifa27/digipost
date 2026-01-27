import React from 'react';
import { FaPenFancy, FaRobot, FaUsers, FaChartLine } from 'react-icons/fa6';

export function QuickActions() {
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-full">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-3">
                <button className="flex items-center p-4 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors group">
                    <div className="p-2 bg-white rounded-full mr-4 shadow-sm group-hover:scale-110 transition-transform">
                        <FaPenFancy />
                    </div>
                    <span className="font-semibold">Create New Post</span>
                </button>
                <button className="flex items-center p-4 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors group">
                    <div className="p-2 bg-white rounded-full mr-4 shadow-sm group-hover:scale-110 transition-transform">
                        <FaRobot />
                    </div>
                    <span className="font-semibold">Generate AI Content</span>
                </button>
                <button className="flex items-center p-4 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors group">
                    <div className="p-2 bg-white rounded-full mr-4 shadow-sm group-hover:scale-110 transition-transform">
                        <FaUsers />
                    </div>
                    <span className="font-semibold">Manage Clients</span>
                </button>
                <button className="flex items-center p-4 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors group">
                    <div className="p-2 bg-white rounded-full mr-4 shadow-sm group-hover:scale-110 transition-transform">
                        <FaChartLine />
                    </div>
                    <span className="font-semibold">View Analytics</span>
                </button>
            </div>
        </div>
    );
}
