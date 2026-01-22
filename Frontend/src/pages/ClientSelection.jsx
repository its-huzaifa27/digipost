import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBuilding, FaSpinner, FaPlus, FaArrowRightFromBracket } from 'react-icons/fa6';
import { ClientCard } from '../components/clients/ClientCard';
import { Button } from '../components/ui/Button';
import { AddClientModal } from '../components/clients/AddClientModal';

export function ClientSelection() {
    const [clients, setClients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

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
            }
        } catch (error) {
            console.error("Failed to fetch clients", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleSelectClient = (client) => {
        localStorage.setItem('selectedClient', JSON.stringify({
            id: client.id,
            name: client.name,
            logo: client.logo
        }));
        navigate('/dashboard');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('selectedClient');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="absolute top-6 right-6">
                <Button variant="ghost" onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-2">
                    <FaArrowRightFromBracket />
                    Logout
                </Button>
            </div>

            <div className="max-w-6xl w-full space-y-8">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
                        <FaBuilding />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Select a Client</h1>
                    <p className="text-gray-500 text-lg">Choose a client workspace to manage or create a new one</p>

                    <div className="flex justify-center pt-4">
                        <Button onClick={() => setIsModalOpen(true)} variant="outline" className="gap-2">
                            <FaPlus /> Add New Client
                        </Button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <FaSpinner className="animate-spin text-3xl text-blue-500" />
                    </div>
                ) : (
                    <>
                        {clients.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {clients.map((client, index) => (
                                    <motion.div
                                        key={client.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        onClick={() => handleSelectClient(client)}
                                        className="cursor-pointer transform transition-transform hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <div className="pointer-events-none h-full">
                                            <ClientCard client={client} />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-500 mb-4">No clients found directly linked to your account.</p>
                                <Button onClick={() => setIsModalOpen(true)} variant="gradient" className="gap-2">
                                    <FaPlus /> Create Your First Client
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <AddClientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchClients}
            />
        </div>
    );
}
