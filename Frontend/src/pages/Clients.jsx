import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Button } from '../components/ui/Button';
import { ClientCard } from '../components/clients/ClientCard';
import { AddClientModal } from '../components/clients/AddClientModal';
import { FaPlus, FaSpinner } from 'react-icons/fa6';
import { motion } from 'framer-motion';

export function Clients() {
    const [clients, setClients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleSelectClient = (client) => {
        localStorage.setItem('selectedClient', JSON.stringify({
            id: client.id,
            name: client.name,
            logo: client.logo
        }));
        navigate('/dashboard');
    };

    const fetchClients = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/clients`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();

                // Transform DB data to frontend Card format
                const formattedClients = data.map(c => ({
                    id: c.id,
                    name: c.client_name,
                    industry: c.industry || 'General',
                    logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(c.client_name)}&background=random&color=fff`,
                    connections: c.connections || [],
                    isActive: c.is_active !== false, // Default to true if undefined
                    stats: {
                        totalPosts: 0, // Placeholder
                        followers: '0'   // Placeholder
                    },
                    platforms: {
                        instagram: { connected: c.instagram_enabled },
                        facebook: { connected: c.facebook_enabled },
                        twitter: { connected: c.twitter_enabled },
                        linkedin: { connected: c.linkedin_enabled },
                        whatsapp: { connected: c.whatsapp_enabled },
                        pinterest: { connected: c.pinterest_enabled },
                        tiktok: { connected: c.tiktok_enabled },
                    }
                }));
                setClients(formattedClients);
            } else if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
            }
        } catch (error) {
            console.error("Failed to fetch clients", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStatus = async (e, client) => {
        e.stopPropagation();
        if (!confirm(`Are you sure you want to ${client.isActive ? 'Suspend' : 'Resume'} services for ${client.name}?`)) return;

        const originalState = [...clients];
        // Optimistic UI update
        setClients(prev => prev.map(c => c.id === client.id ? { ...c, isActive: !c.isActive } : c));

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const token = localStorage.getItem('token');

            const res = await fetch(`${API_URL}/api/clients/${client.id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isActive: !client.isActive })
            });

            if (!res.ok) throw new Error('Failed to update status');

        } catch (err) {
            console.error(err);
            alert("Failed to update status.");
            setClients(originalState); // Revert
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    return (
        <DashboardLayout>
            <div className="p-4 pb-20 space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
                        <p className="text-gray-500 mt-1">Manage all your client brands and their social connections.</p>
                    </div>
                    <Button
                        variant="gradient"
                        className="flex items-center gap-2 shadow-lg shadow-blue-500/20"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <FaPlus className="text-sm" />
                        <span>Add New Client</span>
                    </Button>
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <FaSpinner className="animate-spin text-3xl text-blue-500" />
                    </div>
                ) : (
                    /* Clients Grid */
                    clients.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {clients.map((client, index) => (
                                <motion.div
                                    key={client.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => handleSelectClient(client)}
                                    className="cursor-pointer h-full"
                                >
                                    <ClientCard
                                        client={client}
                                        onManage={() => handleSelectClient(client)}
                                        onToggleStatus={(e) => handleToggleStatus(e, client)}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        /* Empty State */
                        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                                <FaPlus className="text-3xl text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No clients added yet</h3>
                            <p className="text-gray-500 max-w-sm mb-6">
                                Get started by adding your first client brand to manage their social media presence.
                            </p>
                            <Button variant="outline" onClick={() => setIsModalOpen(true)}>Add Your First Client</Button>
                        </div>
                    )
                )}

                {/* Modal */}
                <AddClientModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={fetchClients}
                />
            </div>
        </DashboardLayout>
    );
}
