import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Button } from '../components/ui/Button';
import { FaUserGear, FaLink, FaListCheck, FaRightFromBracket, FaMoon, FaGlobe, FaDesktop } from 'react-icons/fa6';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';

export function Settings() {
    const [activeTab, setActiveTab] = useState('general');
    const navigate = useNavigate();

    // -- Connection State --
    const [isConnected, setIsConnected] = useState(false);
    const [isLoadingConnection, setIsLoadingConnection] = useState(true);

    // -- Audit Log State --
    const [logs, setLogs] = useState([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);
    const [logsPage, setLogsPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // -- Theme State --
    const [isMonoMode, setIsMonoMode] = useState(() => localStorage.getItem('theme_mono') === 'true');

    // Initial Fetch
    useEffect(() => {
        checkConnection();
        if (activeTab === 'audit') fetchLogs();
    }, [activeTab]);

    // Toggle Theme
    const toggleMonoMode = () => {
        const newState = !isMonoMode;
        setIsMonoMode(newState);
        localStorage.setItem('theme_mono', String(newState));

        // Apply immediately to document
        if (newState) {
            document.documentElement.classList.add('grayscale');
        } else {
            document.documentElement.classList.remove('grayscale');
        }
    };

    // Apply theme on load
    useEffect(() => {
        if (localStorage.getItem('theme_mono') === 'true') {
            document.documentElement.classList.add('grayscale');
        }
    }, []);

    const checkConnection = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const token = localStorage.getItem('token');
            const selectedClientRaw = localStorage.getItem('selectedClient');
            const selectedClient = selectedClientRaw ? JSON.parse(selectedClientRaw) : null;
            const clientId = selectedClient?.id;

            if (!clientId) {
                setIsConnected(false);
                setIsLoadingConnection(false);
                return;
            }

            const response = await fetch(`${API_URL}/api/meta/pages?clientId=${clientId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const pages = await response.json();
                setIsConnected(pages.length > 0);
            }
        } catch (error) {
            console.error("Check connection error:", error);
        } finally {
            setIsLoadingConnection(false);
        }
    };

    const fetchLogs = async (page = 1) => {
        setIsLoadingLogs(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/audit?page=${page}&limit=10`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setLogs(data.logs);
                setTotalPages(data.pages);
                setLogsPage(data.currentPage);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingLogs(false);
        }
    };

    const handleConnectFacebook = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await fetch(`${API_URL}/api/meta/auth-url`);
            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                alert('Failed to get auth URL');
            }
        } catch (error) {
            console.error("Auth init error:", error);
            alert('Failed to connect to backend');
        }
    };

    const handleDisconnect = async () => {
        if (!confirm("Are you sure? This will remove all social connections for this client.")) return;

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const token = localStorage.getItem('token');
            const selectedClientRaw = localStorage.getItem('selectedClient');
            const selectedClient = selectedClientRaw ? JSON.parse(selectedClientRaw) : null;
            const clientId = selectedClient?.id;

            const response = await fetch(`${API_URL}/api/meta/disconnect`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ clientId })
            });

            if (response.ok) {
                setIsConnected(false);
            } else {
                alert("Failed to disconnect");
            }
        } catch (error) {
            console.error("Disconnect error:", error);
        }
    };

    const handleLogout = () => {
        if (confirm("Are you sure you want to logout?")) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/auth');
        }
    };

    const Tabs = [
        { id: 'general', label: 'General Settings', icon: <FaUserGear /> },
        { id: 'connections', label: 'Connected Accounts', icon: <FaLink /> },
        { id: 'audit', label: 'Audit Log', icon: <FaListCheck /> },
    ];

    return (
        <DashboardLayout>
            <div className="p-6 space-y-6 max-w-5xl mx-auto">
                <div className="flex flex-col gap-2 mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
                    <p className="text-gray-500 text-lg">Manage your workspace preferences and system logs.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Tabs */}
                    <div className="w-full md:w-64 flex-shrink-0 space-y-2">
                        {Tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={clsx(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                                    activeTab === tab.id
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                                        : "bg-white text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200"
                                )}
                            >
                                <span className="text-lg">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}

                        <div className="pt-4 mt-4 border-t border-gray-100">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <span className="text-lg"><FaRightFromBracket /></span>
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 min-w-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">

                        {/* GENERAL TAB */}
                        {activeTab === 'general' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-1">App Appearance</h2>
                                    <p className="text-sm text-gray-500 mb-6">Customize how DigiPost looks for you.</p>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gray-900 text-white rounded-lg flex items-center justify-center">
                                                <FaMoon />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">Suggested Black & White UI</h3>
                                                <p className="text-xs text-gray-500">Enable grayscale mode for better focus.</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked={isMonoMode} onChange={toggleMonoMode} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                                        </label>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100">
                                    <h2 className="text-xl font-bold text-gray-900 mb-1">Localization</h2>
                                    <p className="text-sm text-gray-500 mb-6">Set your language and region.</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Language</label>
                                            <div className="relative">
                                                <FaGlobe className="absolute left-3 top-3 text-gray-400" />
                                                <select className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" disabled>
                                                    <option>English (US)</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Timezone</label>
                                            <div className="relative">
                                                <FaDesktop className="absolute left-3 top-3 text-gray-400" />
                                                <select className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" disabled>
                                                    <option>UTC (Auto)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CONNECTIONS TAB */}
                        {activeTab === 'connections' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-1">Social Connections</h2>
                                    <p className="text-sm text-gray-500 mb-6">Manage API links to your social platforms.</p>
                                </div>

                                <div className="flex items-center justify-between p-5 border border-blue-100 bg-blue-50/30 rounded-xl">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-[#1877F2] rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-sm">
                                            f
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">Facebook & Instagram</h3>
                                            <p className="text-sm text-gray-500 mt-0.5">
                                                {isConnected ? <span className="text-green-600 font-medium flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Active Connection</span> : 'Connect your pages to start auto-posting.'}
                                            </p>
                                        </div>
                                    </div>

                                    {isConnected ? (
                                        <Button variant="destructive" onClick={handleDisconnect}>
                                            Disconnect
                                        </Button>
                                    ) : (
                                        <Button onClick={handleConnectFacebook}>
                                            Connect Account
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* AUDIT LOG TAB */}
                        {activeTab === 'audit' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-1">Audit Log</h2>
                                    <p className="text-sm text-gray-500 mb-6">Track system activities and user actions.</p>
                                </div>

                                <div className="border border-gray-200 rounded-xl overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase text-xs">
                                            <tr>
                                                <th className="px-6 py-4">Action</th>
                                                <th className="px-6 py-4">Date & Time</th>
                                                <th className="px-6 py-4">Details</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {isLoadingLogs ? (
                                                <tr>
                                                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500">Loading activity...</td>
                                                </tr>
                                            ) : logs.length > 0 ? (
                                                logs.map(log => (
                                                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-medium text-gray-900">
                                                            <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">{log.action}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-500">
                                                            {new Date(log.createdAt).toLocaleString()}
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={log.details}>
                                                            {log.details || '-'}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" className="px-6 py-12 text-center text-gray-400">
                                                        No activity recorded yet.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
