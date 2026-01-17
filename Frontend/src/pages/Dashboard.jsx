import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { TopBar } from '../components/dashboard/TopBar';
import { StatCard } from '../components/dashboard/StatCard';
import { EngagementChart } from '../components/dashboard/EngagementChart';
import { QuickActions } from '../components/dashboard/QuickActions';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { MOCK_CLIENTS } from '../data/mockData';
import { FaFilePen, FaChartBar, FaBolt, FaUsers } from 'react-icons/fa6';

export function Dashboard() {
    const [selectedClientId, setSelectedClientId] = useState('all');
    const [stats, setStats] = useState({
        totalPosts: 0,
        engagementRate: 0,
        viralScore: 0,
        followers: 0
    });
    const [engagementData, setEngagementData] = useState([]);
    const [clients, setClients] = useState([]);
    const [selectedClientName, setSelectedClientName] = useState('All Clients');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const token = localStorage.getItem('token');

                // Build Query
                const query = selectedClientId !== 'all' ? `?clientId=${selectedClientId}` : '';

                const response = await fetch(`${API_URL}/api/dashboard/stats${query}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setStats(data.stats);
                    setEngagementData(data.stats.trendData);
                    setClients(data.clients);

                    // Update client name for display
                    if (selectedClientId === 'all') {
                        setSelectedClientName('All Clients');
                    } else {
                        const current = data.clients.find(c => c.id === selectedClientId);
                        if (current) setSelectedClientName(current.name);
                    }
                }
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            }
        };

        fetchDashboardData();
    }, [selectedClientId]);

    return (
        <DashboardLayout>
            <TopBar
                clients={clients}
                selectedClientId={selectedClientId}
                onSelectClient={setSelectedClientId}
            />

            <div className="p-6 space-y-8 overflow-y-auto pb-20">
                {/* Welcome & Context */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Good Morning, Admin</h1>
                    <p className="text-gray-500">Here's what's happening with <span className="font-semibold text-gray-700">{selectedClientName}</span> today.</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Posts"
                        value={stats.totalPosts}
                        icon={<FaFilePen className="text-blue-600" />}
                        color="bg-blue-100"
                        trend={0}
                    />
                    <StatCard
                        title="Engagement Rate"
                        value={`${stats.engagementRate}%`}
                        icon={<FaChartBar className="text-purple-600" />}
                        color="bg-purple-100"
                        trend={0}
                    />
                    <StatCard
                        title="Viral Score"
                        value={stats.viralScore}
                        icon={<FaBolt className="text-yellow-600" />}
                        color="bg-yellow-100"
                        subtext="High impact content"
                    />
                    <StatCard
                        title="Total Followers"
                        value={stats.followers}
                        icon={<FaUsers className="text-green-600" />}
                        color="bg-green-100"
                        trend={0}
                    />
                </div>

                {/* Main Content Area: Chart + Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 h-[400px]">
                        <EngagementChart data={engagementData} />
                    </div>
                    <div className="lg:col-span-1">
                        <QuickActions />
                    </div>
                </div>

                {/* Recent Activity - Placeholder or Hidden until we have Posts Endpoint */}
                <div className="grid grid-cols-1">
                    {/* Placeholder for now */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 text-center text-gray-400 italic">
                        No recent activity found.
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
