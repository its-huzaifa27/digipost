import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FullWidthLayout } from '../components/layout/FullWidthLayout';
import { TopBar } from '../components/dashboard/TopBar';
import { ConnectedPlatformsWidget } from '../components/dashboard/ConnectedPlatformsWidget';
import { CreatePostWidget } from '../components/dashboard/CreatePostWidget';
import { Button } from '../components/ui/Button';
import { FaChartPie, FaRobot, FaPlus, FaLink } from 'react-icons/fa6';
import { AnalyticsContent } from '../components/dashboard/AnalyticsContent';
import { CreatePostContent } from '../components/dashboard/CreatePostContent';
import { AIAgentContent } from '../components/dashboard/AIAgentContent';

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

    const [searchParams, setSearchParams] = useSearchParams();
    const activeView = searchParams.get('view') || 'overview'; // 'overview', 'analytics', 'create-post', 'ai-agent'

    // Helper to switch views
    const setActiveView = (view) => {
        setSearchParams({ view });
    };

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
                        <div className="flex items-center gap-2 mb-1">
                            {activeView !== 'overview' && (
                                <button
                                    onClick={() => setActiveView('overview')}
                                    className="text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1 text-sm font-semibold"
                                >
                                    <span>← Dash</span>
                                </button>
                            )}
                            <h1 className="text-3xl font-bold text-gray-900">
                                {activeView === 'overview' ? 'Good Morning, Admin' : (
                                    activeView === 'analytics' ? 'Performance Insights' : (
                                        activeView === 'create-post' ? 'Content Studio' : 'AI Assistant'
                                    )
                                )}
                            </h1>
                        </div>
                        <p className="text-gray-500 text-lg">Here's what's happening with <span className="font-semibold text-gray-700">{selectedClientName}</span> today.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button
                            onClick={() => setActiveView('ai-agent')}
                            className={`gap-2 shadow-sm border-none transition-all ${activeView === 'ai-agent' ? 'bg-purple-700 ring-2 ring-purple-500/50' : 'bg-linear-to-r from-purple-600 to-indigo-600 hover:opacity-90'} text-white`}
                        >
                            <FaRobot className="text-white" />
                            <span>AI Agent</span>
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => setActiveView('analytics')}
                            className={`gap-2 shadow-sm border ${activeView === 'analytics' ? 'bg-blue-50 border-blue-300 text-blue-700 ring-2 ring-blue-500/20' : 'border-gray-200'}`}
                        >
                            <FaChartPie className={activeView === 'analytics' ? 'text-blue-700' : 'text-blue-600'} />
                            <span>View Analytics</span>
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => setActiveView('create-post')}
                            className={`gap-2 shadow-sm border ${activeView === 'create-post' ? 'bg-green-50 border-green-300 text-green-700 ring-2 ring-green-500/20' : 'border-gray-200'}`}
                        >
                            <FaPlus className={activeView === 'create-post' ? 'text-green-700' : 'text-green-600'} />
                            <span>Create Post</span>
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => setActiveView('overview')}
                            className={`gap-2 shadow-sm border ${activeView === 'overview' && false ? 'bg-orange-50 border-orange-300 text-orange-700' : 'border-gray-200'}`}
                        >
                            <FaLink className="text-orange-600" />
                            <span>Connect Platform</span>
                        </Button>
                    </div>
                </div>

                {/* Main Content Area (The "Blue" Area) */}
                <div className="min-h-[600px] transition-all duration-300">
                    {activeView === 'overview' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            {/* Main Content: Just Connected Platforms & Create Post */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Platform Status - Needs to receive client prop */}
                                <div className="lg:col-span-2">
                                    <ConnectedPlatformsWidget client={selectedClientData} />
                                </div>

                                {/* Quick Actions / Create Post */}
                                <div className="lg:col-span-1 min-h-[300px]">
                                    <CreatePostWidget onStart={() => setActiveView('create-post')} />
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
                    )}

                    {activeView === 'analytics' && (
                        <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
                            <AnalyticsContent />
                        </div>
                    )}

                    {activeView === 'create-post' && (
                        <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
                            <CreatePostContent />
                        </div>
                    )}

                    {activeView === 'ai-agent' && (
                        <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
                            <AIAgentContent />
                        </div>
                    )}
                </div>
            </div>
        </FullWidthLayout>
    );
}
