import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';

export function Settings() {
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkConnection();
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
                setIsLoading(false);
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
            setIsLoading(false);
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
                // Optional: Force reload to clear any cached states elsewhere
                // window.location.reload(); 
            } else {
                alert("Failed to disconnect");
            }
        } catch (error) {
            console.error("Disconnect error:", error);
        }
    };

    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-500">Manage your account and application preferences.</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-8">
                    <h2 className="text-xl font-bold mb-6">Connected Accounts</h2>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                                f
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Facebook & Instagram</h3>
                                <p className="text-sm text-gray-500">
                                    {isConnected ? 'Connected via Meta' : 'Connect your pages to auto-post.'}
                                </p>
                            </div>
                        </div>

                        {isConnected ? (
                            <button
                                onClick={handleDisconnect}
                                className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition font-medium"
                            >
                                Disconnect
                            </button>
                        ) : (
                            <button
                                onClick={handleConnectFacebook}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                Connect Account
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
