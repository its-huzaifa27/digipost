import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { FaInstagram, FaChartLine, FaUsers, FaEye, FaSpinner, FaTriangleExclamation } from 'react-icons/fa6';

export function Analytics() {
    const [connections, setConnections] = useState([]);
    const [selectedConnection, setSelectedConnection] = useState(null);
    const [insights, setInsights] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingInsights, setIsFetchingInsights] = useState(false);
    const [error, setError] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const token = localStorage.getItem('token');
    const storedClient = JSON.parse(localStorage.getItem('selectedClient') || '{}');

    useEffect(() => {
        fetchConnections();
    }, [storedClient.id]);

    const fetchConnections = async () => {
        if (!storedClient.id) return;
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/meta/pages?clientId=${storedClient.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                const igConnections = data.filter(c => c.platform === 'instagram');
                setConnections(igConnections);
                if (igConnections.length > 0) {
                    setSelectedConnection(igConnections[0]);
                }
            } else {
                setError("Failed to fetch connected accounts");
            }
        } catch (err) {
            setError("Error connecting to the server");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (selectedConnection) {
            fetchInsights(selectedConnection.id);
        }
    }, [selectedConnection]);

    const fetchInsights = async (connectionId) => {
        setIsFetchingInsights(true);
        try {
            const response = await fetch(`${API_URL}/api/meta/insights/${connectionId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setInsights(data);
            } else {
                setError("Failed to fetch insights for this account");
            }
        } catch (err) {
            setError("Error fetching insights");
        } finally {
            setIsFetchingInsights(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <FaSpinner className="animate-spin text-3xl text-blue-500" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="p-6 space-y-6 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold text-gray-900">Instagram Analytics</h1>
                        <p className="text-gray-500">Real-time performance metrics for your connected accounts.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Profile Badge */}
                        {selectedConnection && (
                            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-full pl-2 pr-4 py-1.5 shadow-sm">
                                <div className="w-8 h-8 rounded-full bg-linear-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                    {insights?.profile?.profile_picture_url ? (
                                        <img src={insights.profile.profile_picture_url} alt={selectedConnection.pageName} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <FaInstagram className="text-lg" />
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Viewing</span>
                                    <span className="text-sm font-bold text-gray-900 leading-none">{selectedConnection.pageName}</span>
                                </div>
                            </div>
                        )}

                        {connections.length > 1 && (
                            <div className="relative">
                                <select
                                    className="appearance-none bg-white border border-gray-200 rounded-lg pl-4 pr-10 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer hover:border-purple-200 transition-colors"
                                    value={selectedConnection?.id}
                                    onChange={(e) => setSelectedConnection(connections.find(c => c.id === e.target.value))}
                                >
                                    {connections.map(c => (
                                        <option key={c.id} value={c.id}>{c.pageName}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 text-red-600">
                        <FaTriangleExclamation />
                        <span>{error}</span>
                    </div>
                )}

                {connections.length === 0 ? (
                    <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center space-y-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400">
                            <FaInstagram className="text-3xl" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No Instagram Accounts Connected</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            Connect an Instagram Business account in the Dashboard to see analytics here.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Followers Card */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-pink-50 text-pink-600 rounded-xl group-hover:scale-110 transition-transform">
                                    <FaUsers className="text-xl" />
                                </div>
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-gray-500 text-sm font-medium">Total Followers</h3>
                                <p className="text-2xl font-bold text-gray-900">
                                    {isFetchingInsights ? <FaSpinner className="animate-spin" /> : (insights?.profile?.followers_count || 0).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {/* Reach Card */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                                    <FaChartLine className="text-xl" />
                                </div>
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Today</span>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-gray-500 text-sm font-medium">Account Reach</h3>
                                <p className="text-2xl font-bold text-gray-900">
                                    {isFetchingInsights ? <FaSpinner className="animate-spin" /> : (insights?.insights?.find(i => i.name === 'reach')?.values[0]?.value || 0).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {/* New Followers Card */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-green-50 text-green-600 rounded-xl group-hover:scale-110 transition-transform">
                                    <FaUsers className="text-xl" />
                                </div>
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">Today</span>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-gray-500 text-sm font-medium">New Followers</h3>
                                <p className="text-2xl font-bold text-gray-900">
                                    {isFetchingInsights ? <FaSpinner className="animate-spin" /> : (insights?.insights?.find(i => i.name === 'follower_count')?.values[0]?.value || 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
