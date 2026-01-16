import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { TopBar } from '../components/dashboard/TopBar';
import { StatCard } from '../components/dashboard/StatCard';
import { EngagementChart } from '../components/dashboard/EngagementChart';
import { QuickActions } from '../components/dashboard/QuickActions';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { MOCK_CLIENTS } from '../data/mockData';
import { FaFilePen, FaChartBar, FaBolt, FaUsers } from 'react-icons/fa6';

export function Dashboard() {
    const [selectedClientId, setSelectedClientId] = useState(MOCK_CLIENTS[0].id);

    const selectedClient = MOCK_CLIENTS.find(c => c.id === selectedClientId) || MOCK_CLIENTS[0];

    return (
        <DashboardLayout>
            <TopBar
                clients={MOCK_CLIENTS}
                selectedClientId={selectedClientId}
                onSelectClient={setSelectedClientId}
            />

            <div className="p-8 space-y-8 overflow-y-auto pb-20">
                {/* Welcome & Context */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Good Morning, Admin</h1>
                    <p className="text-gray-500">Here's what's happening with <span className="font-semibold text-gray-700">{selectedClient.name}</span> today.</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Posts"
                        value={selectedClient.stats.totalPosts}
                        icon={<FaFilePen className="text-blue-600" />}
                        color="bg-blue-100"
                        trend={12}
                    />
                    <StatCard
                        title="Engagement Rate"
                        value={selectedClient.stats.engagementRate}
                        icon={<FaChartBar className="text-purple-600" />}
                        color="bg-purple-100"
                        trend={5}
                    />
                    <StatCard
                        title="Viral Score"
                        value={selectedClient.stats.viralScore}
                        icon={<FaBolt className="text-yellow-600" />}
                        color="bg-yellow-100"
                        subtext="High impact content"
                    />
                    <StatCard
                        title="Total Followers"
                        value={selectedClient.stats.followers}
                        icon={<FaUsers className="text-green-600" />}
                        color="bg-green-100"
                        trend={8}
                    />
                </div>

                {/* Main Content Area: Chart + Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 h-[400px]">
                        <EngagementChart data={selectedClient.engagementData} />
                    </div>
                    <div className="lg:col-span-1">
                        <QuickActions />
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1">
                    <RecentActivity activities={selectedClient.recentActivity} />
                </div>
            </div>
        </DashboardLayout>
    );
}
