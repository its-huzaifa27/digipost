import React, { useEffect, useMemo, useState } from 'react';
import { FaInstagram, FaFacebookF, FaTwitter, FaLinkedinIn, FaWhatsapp, FaPinterest, FaTiktok } from 'react-icons/fa6';
import { clsx } from 'clsx';
import { Button } from '../ui/Button';

export function ConnectedPlatformsWidget({ client }) {
    const clientId = client?.id;

    const [connections, setConnections] = useState([]);

    const connectedPlatforms = useMemo(() => {
        if (!connections) return new Set();
        return new Set(connections.map((c) => c.platform));
    }, [connections]);

    const platformIcons = [
        { id: 'instagram', label: 'Instagram', icon: <FaInstagram />, color: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white' },
        { id: 'facebook', label: 'Facebook', icon: <FaFacebookF />, color: 'bg-blue-600 text-white' },
        { id: 'twitter', label: 'Twitter', icon: <FaTwitter />, color: 'bg-black text-white' },
        { id: 'linkedin', label: 'LinkedIn', icon: <FaLinkedinIn />, color: 'bg-blue-700 text-white' },
        { id: 'whatsapp', label: 'WhatsApp', icon: <FaWhatsapp />, color: 'bg-green-500 text-white' },
        { id: 'pinterest', label: 'Pinterest', icon: <FaPinterest />, color: 'bg-red-600 text-white' },
        { id: 'tiktok', label: 'TikTok', icon: <FaTiktok />, color: 'bg-black text-white' },
    ];

    const fetchConnections = async () => {
        if (!clientId) return;
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/meta/pages?clientId=${encodeURIComponent(clientId)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) return;
            const data = await res.json();
            setConnections(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('Failed to load platform connections', e);
        }
    };

    useEffect(() => {
        if (clientId) {
            fetchConnections();
        } else {
            setConnections([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clientId]);

    if (!client) return null;

    const handleDisconnect = async (platformId) => {
        if (!confirm(`Are you sure you want to disconnect ${platformId}?`)) return;

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_URL}/api/meta/disconnect`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ clientId, platform: platformId })
            });

            if (response.ok) {
                // Refresh list
                fetchConnections();
            } else {
                alert("Failed to disconnect");
            }
        } catch (error) {
            console.error("Disconnect error:", error);
        }
    };

    const handleConnect = async (platformId) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const token = localStorage.getItem('token');

            // For Facebook and Instagram, use the new Production Meta Service
            if (platformId === 'facebook' || platformId === 'instagram') {
                const response = await fetch(`${API_URL}/api/meta/auth-url`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();

                if (data.url) {
                    window.location.href = data.url;
                } else {
                    alert('Failed to get Meta Auth URL');
                }
                return;
            }

            // Legacy/Other platforms
            const response = await fetch(`${API_URL}/api/auth/connect/${platformId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to get auth URL');

            const data = await response.json();
            if (data.url) {
                // Redirects the user to the platform's OAuth page
                window.location.href = data.url;
            } else {
                console.error("No URL returned from backend");
                alert("Could not initiate connection: Backend returned no URL.");
            }
        } catch (error) {
            console.error("Connection failed:", error);
            alert("Failed to initiate connection. Please check if backend is running.");
        }
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Connected Platforms</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
                {platformIcons.map((p) => {
                    const isConnected = connectedPlatforms.has(p.id) || client.platforms?.[p.id]?.connected;
                    return (
                        <div
                            key={p.id}
                            onClick={() => isConnected ? handleDisconnect(p.id) : handleConnect(p.id)}
                            className={clsx(
                                "flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200",
                                isConnected
                                    ? "bg-gray-50 border-gray-100 cursor-pointer hover:bg-red-50 hover:border-red-200"
                                    : "bg-white border-gray-100 border-dashed opacity-60 hover:opacity-100 hover:border-blue-300 hover:shadow-sm cursor-pointer group"
                            )}
                            title={isConnected ? `Click to Disconnect ${p.label}` : `Connect to ${p.label}`}
                        >
                            <div className={clsx(
                                "w-10 h-10 rounded-full flex items-center justify-center text-lg mb-2 shadow-sm",
                                isConnected ? p.color : "bg-gray-200 text-gray-400 group-hover:text-blue-500"
                            )}>
                                {p.icon}
                            </div>
                            <span className="text-xs font-semibold text-gray-700">{p.label}</span>
                            <span className={clsx(
                                "text-[10px] uppercase tracking-wider font-bold mt-1",
                                isConnected ? "text-green-600" : "text-gray-400 group-hover:text-blue-600"
                            )}>
                                {isConnected ? 'Active' : 'Connect'}
                            </span>
                        </div>
                    );
                })}
            </div>

        </div>
    );
}
