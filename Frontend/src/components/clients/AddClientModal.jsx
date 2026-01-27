import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaXmark, FaInstagram, FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp, FaPinterest, FaTiktok } from 'react-icons/fa6';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { clsx } from 'clsx';

const PlatformToggle = ({ id, label, icon, checked, onChange }) => (
    <div
        onClick={() => onChange(!checked)}
        className={clsx(
            "cursor-pointer border rounded-lg p-3 flex items-center justify-between transition-all duration-200",
            checked ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
        )}
    >
        <div className="flex items-center gap-3">
            <div className={clsx("text-lg", checked ? "text-blue-600" : "text-gray-400")}>
                {icon}
            </div>
            <span className={clsx("text-sm font-medium", checked ? "text-blue-700" : "text-gray-600")}>
                {label}
            </span>
        </div>
        <div className={clsx(
            "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
            checked ? "bg-blue-500 border-blue-500" : "border-gray-300"
        )}>
            {checked && <div className="w-2 h-2 bg-white rounded-full" />}
        </div>
    </div>
);

export function AddClientModal({ isOpen, onClose, onSuccess }) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        client_name: '',
        industry: '',
        brand_description: '',
        instagram_enabled: false,
        facebook_enabled: false,
        twitter_enabled: false,
        linkedin_enabled: false,
        whatsapp_enabled: false,
        pinterest_enabled: false,
        tiktok_enabled: false,
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';


            const response = await fetch(`${API_URL}/api/clients`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to create client');

            // Success
            onSuccess();
            onClose();
            // Reset form
            setFormData({
                client_name: '',
                industry: '',
                brand_description: '',
                instagram_enabled: false,
                facebook_enabled: false,
                twitter_enabled: false,
                linkedin_enabled: false,
                whatsapp_enabled: false,
                pinterest_enabled: false,
                tiktok_enabled: false,
            });

        } catch (error) {
            console.error('Error adding client:', error);
            alert('Failed to add client. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">Add New Client</h2>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                            <FaXmark />
                        </button>
                    </div>

                    {/* Scrollable Body */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <form id="add-client-form" onSubmit={handleSubmit} className="space-y-6">

                            {/* Basic Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Brand Details</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Client Name / Brand Name *</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.client_name}
                                            onChange={e => setFormData({ ...formData, client_name: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            placeholder="e.g. Acme Corp"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                                        <input
                                            type="text"
                                            value={formData.industry}
                                            onChange={e => setFormData({ ...formData, industry: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            placeholder="e.g. SaaS, Retail"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand Description (for AI Context)</label>
                                    <textarea
                                        rows="3"
                                        value={formData.brand_description}
                                        onChange={e => setFormData({ ...formData, brand_description: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                        placeholder="Briefly describe what this company does..."
                                    />
                                </div>
                            </div>

                            <div className="h-px bg-gray-100" />

                            {/* Platforms */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Enabled Platforms</h3>
                                <p className="text-sm text-gray-500 -mt-2 mb-3">Select which platforms this client will use.</p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <PlatformToggle
                                        checked={formData.instagram_enabled}
                                        onChange={v => setFormData({ ...formData, instagram_enabled: v })}
                                        label="Instagram"
                                        icon={<FaInstagram />}
                                    />
                                    <PlatformToggle
                                        checked={formData.facebook_enabled}
                                        onChange={v => setFormData({ ...formData, facebook_enabled: v })}
                                        label="Facebook"
                                        icon={<FaFacebook />}
                                    />
                                    <PlatformToggle
                                        checked={formData.twitter_enabled}
                                        onChange={v => setFormData({ ...formData, twitter_enabled: v })}
                                        label="Twitter / X"
                                        icon={<FaTwitter />}
                                    />
                                    <PlatformToggle
                                        checked={formData.linkedin_enabled}
                                        onChange={v => setFormData({ ...formData, linkedin_enabled: v })}
                                        label="LinkedIn"
                                        icon={<FaLinkedin />}
                                    />
                                    <PlatformToggle
                                        checked={formData.tiktok_enabled}
                                        onChange={v => setFormData({ ...formData, tiktok_enabled: v })}
                                        label="TikTok"
                                        icon={<FaTiktok />}
                                    />
                                    <PlatformToggle
                                        checked={formData.pinterest_enabled}
                                        onChange={v => setFormData({ ...formData, pinterest_enabled: v })}
                                        label="Pinterest"
                                        icon={<FaPinterest />}
                                    />
                                </div>
                            </div>

                        </form>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                        <Button variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" form="add-client-form" disabled={isLoading} variant="gradient">
                            {isLoading ? 'Creating...' : 'Create Client'}
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
