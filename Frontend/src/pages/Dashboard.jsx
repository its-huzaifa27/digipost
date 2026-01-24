import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FullWidthLayout } from '../components/layout/FullWidthLayout';
import { TopBar } from '../components/dashboard/TopBar';
import { ConnectedPlatformsWidget } from '../components/dashboard/ConnectedPlatformsWidget';
import { CreatePostWidget } from '../components/dashboard/CreatePostWidget';
import { Button } from '../components/ui/Button';
import { FaChartPie, FaRobot } from 'react-icons/fa6';

export function Dashboard() {
    const navigate = useNavigate();
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

    // Initialize from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('selectedClient');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed && parsed.id) {
                    setSelectedClientId(parsed.id);
                    setSelectedClientName(parsed.name || 'Client');
                }
            } catch (e) {
                console.error("Failed to parse selected client", e);
            }
        }
    }, []);

    const handleClientChange = (clientId) => {
        setSelectedClientId(clientId);

        if (clientId === 'all') {
            localStorage.setItem('selectedClient', JSON.stringify({ id: 'all', name: 'All Clients' }));
            setSelectedClientName('All Clients');
        } else {
            const client = clients.find(c => c.id === clientId);
            if (client) {
                localStorage.setItem('selectedClient', JSON.stringify({
                    id: client.id,
                    name: client.client_name || client.name,
                    logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(client.client_name)}&background=random&color=fff`
                }));
                setSelectedClientName(client.name);
            }
        }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const token = localStorage.getItem('token');
                const query = selectedClientId !== 'all' ? `?clientId=${selectedClientId}` : '';

                const response = await fetch(`${API_URL}/api/dashboard/stats${query}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setStats(data.stats);
                    setEngagementData(data.stats.trendData);
                    setClients(data.clients);

                    if (selectedClientId !== 'all') {
                        const current = data.clients.find(c => c.id === selectedClientId);
                        if (current) setSelectedClientName(current.name);
                    } else {
                        setSelectedClientName('All Clients');
                    }
                }
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            }
        };

        fetchDashboardData();
    }, [selectedClientId]);

    const selectedClientData = clients.find(c => c.id === selectedClientId);

    return (
        <FullWidthLayout>
            {/* Floating Toggle for Analysis Drawer (Visible when drawer is closed) */}
            <div className="sticky top-0 z-20">
                <TopBar
                    clients={clients}
                    selectedClientId={selectedClientId}
                    onSelectClient={handleClientChange}
                />
            </div>

            <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Good Morning, Admin</h1>
                        <p className="text-gray-500 text-lg">Here's what's happening with <span className="font-semibold text-gray-700">{selectedClientName}</span> today.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={() => navigate('/ai-agent')}
                            className="gap-2 shadow-sm border-none bg-linear-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 transition-opacity"
                        >
                            <FaRobot className="text-white" />
                            <span>AI Agent</span>
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => navigate('/analytics')}
                            className="gap-2 shadow-sm border border-gray-200"
                        >
                            <FaChartPie className="text-blue-600" />
                            <span>View Analytics</span>
                        </Button>
                    </div>
                </div>

                {/* Main Content: Just Connected Platforms & Create Post */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Platform Status - Needs to receive client prop */}
                    <div className="lg:col-span-2">
                        <ConnectedPlatformsWidget client={selectedClientData} />
                    </div>

                    {/* Quick Actions / Create Post */}
                    <div className="lg:col-span-1 min-h-[300px]">
                        <CreatePostWidget />
                    </div>
                </div>

                {/* Recent Activity Placeholder */}
                <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center">
                    <div className="max-w-md mx-auto">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Recent Activity</h3>
                        <p className="text-gray-500 italic">No recent activity found for this client.</p>
                    </div>
                </div>
            </div>


        </FullWidthLayout>
    );
}
