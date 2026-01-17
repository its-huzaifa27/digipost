import React from 'react';
import { FaInstagram, FaFacebookF, FaTwitter, FaLinkedinIn, FaWhatsapp, FaPinterest, FaTiktok, FaChevronDown } from 'react-icons/fa6';
import { clsx } from 'clsx';

export function TopBar({ clients, selectedClientId, onSelectClient }) {

    const isAllClients = selectedClientId === 'all';
    const selectedClient = clients.find(c => c.id === selectedClientId);

    const platformIcons = [
        { id: 'instagram', icon: <FaInstagram />, color: 'text-pink-600' },
        { id: 'facebook', icon: <FaFacebookF />, color: 'text-blue-600' },
        { id: 'twitter', icon: <FaTwitter />, color: 'text-black' },
        { id: 'linkedin', icon: <FaLinkedinIn />, color: 'text-blue-700' },
        { id: 'whatsapp', icon: <FaWhatsapp />, color: 'text-green-500' },
        { id: 'pinterest', icon: <FaPinterest />, color: 'text-red-600' },
        { id: 'tiktok', icon: <FaTiktok />, color: 'text-black' },
    ];

    return (
        <div className="h-20 bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100 px-8 flex items-center justify-between">
            {/* Client Selector */}
            <div className="flex items-center space-x-4">
                <span className="text-gray-400 text-sm font-medium hidden sm:block">Managing:</span>
                <div className="relative group">
                    <button className="flex items-center space-x-3 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-xl transition-all border border-gray-200 min-w-[200px] justify-between">
                        <div className="flex items-center space-x-3">
                            {isAllClients ? (
                                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs">ALL</div>
                            ) : (
                                selectedClient?.logo ? (
                                    <img src={selectedClient.logo} alt="Client Logo" className="w-8 h-8 rounded-lg" />
                                ) : (
                                    <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                                )
                            )}
                            <span className="font-semibold text-gray-900 text-sm">
                                {isAllClients ? 'All Clients' : (selectedClient?.name || 'Select Client')}
                            </span>
                        </div>
                        <FaChevronDown className="text-gray-400 text-xs" />
                    </button>

                    {/* Dropdown Menu */}
                    <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden hidden group-hover:block animate-fade-in-down z-50">
                        <button
                            onClick={() => onSelectClient('all')}
                            className="flex items-center space-x-3 w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50"
                        >
                            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs">ALL</div>
                            <span className="font-medium text-sm text-gray-700">All Clients</span>
                        </button>
                        {clients.map(client => (
                            <button
                                key={client.id}
                                onClick={() => onSelectClient(client.id)}
                                className="flex items-center space-x-3 w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                            >
                                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=random&color=fff`} alt="" className="w-8 h-8 rounded-lg" />
                                <span className="font-medium text-sm text-gray-700">{client.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Platform Status */}
            <div className="flex items-center space-x-1 sm:space-x-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                {platformIcons.map((p) => {
                    // For 'All Clients', we don't show specific connections, or maybe show all grey?
                    // Let's show grey for 'All'
                    const isConnected = !isAllClients && selectedClient?.platforms?.[p.id]?.connected;
                    return (
                        <div
                            key={p.id}
                            className={clsx(
                                "p-2 rounded-full transition-all duration-300",
                                isConnected ? "bg-white shadow-sm " + p.color : "text-gray-300"
                            )}
                            title={isConnected ? `Connected to ${p.id}` : `Not connected`}
                        >
                            <span className="text-sm">{p.icon}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
