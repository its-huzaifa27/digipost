import React from 'react';
import { motion } from 'framer-motion';
import { FaInstagram, FaLinkedin, FaTwitter, FaFacebook, FaTiktok, FaPinterest, FaWhatsapp } from 'react-icons/fa6';
import { clsx } from 'clsx';
import { Button } from '../ui/Button';

const PlatformIcon = ({ platform, connected }) => {
    const icons = {
        instagram: <FaInstagram />,
        linkedin: <FaLinkedin />,
        twitter: <FaTwitter />,
        facebook: <FaFacebook />,
        tiktok: <FaTiktok />,
        pinterest: <FaPinterest />,
        whatsapp: <FaWhatsapp />
    };

    return (
        <div className={clsx(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-200",
            connected
                ? "bg-green-50 text-green-600 border border-green-100"
                : "bg-gray-50 text-gray-300 border border-gray-100 grayscale opacity-60"
        )} title={connected ? "Connected" : "Not connected"}>
            {icons[platform] || platform[0].toUpperCase()}
        </div>
    );
};

const ConnectionBadges = ({ connections }) => {
    if (!connections || connections.length === 0) return null;

    // Group by platform and show the connected page/account names
    const byPlatform = connections.reduce((acc, c) => {
        const key = c.platform;
        if (!acc[key]) acc[key] = [];
        acc[key].push(c);
        return acc;
    }, {});

    const order = ['facebook', 'instagram', 'linkedin', 'twitter', 'whatsapp', 'pinterest', 'tiktok'];

    return (
        <div className="mt-3">
            <p className="text-xs text-gray-400 mb-2 font-medium">Connected Accounts</p>
            <div className="space-y-2">
                {order.filter(p => byPlatform[p]).map((platform) => (
                    <div key={platform} className="flex items-start gap-2">
                        <span className="text-xs font-bold uppercase tracking-wide text-gray-500 w-20 shrink-0">
                            {platform}
                        </span>
                        <div className="flex flex-wrap gap-1">
                            {byPlatform[platform].slice(0, 2).map((c) => (
                                <span
                                    key={c.id}
                                    className="text-xs px-2 py-0.5 rounded-full bg-gray-50 border border-gray-100 text-gray-700 max-w-[220px] truncate"
                                    title={c.pageName || c.pageId || ''}
                                >
                                    {c.pageName || c.pageId || 'Connected'}
                                </span>
                            ))}
                            {byPlatform[platform].length > 2 && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700">
                                    +{byPlatform[platform].length - 2} more
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export function ClientCard({ client, onManage }) {
    return (
        <motion.div
            whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
            className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col h-full transition-shadow duration-200"
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                    <img
                        src={client.logo}
                        alt={client.name}
                        className="w-12 h-12 rounded-lg object-cover bg-gray-50 ring-1 ring-gray-100"
                    />
                    <div>
                        <h3 className="font-bold text-gray-900 leading-tight">{client.name}</h3>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                            {client.industry}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gray-50 rounded-lg p-2.5">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Total Posts</p>
                    <p className="text-lg font-bold text-gray-800">{client.stats.totalPosts}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Followers</p>
                    <p className="text-lg font-bold text-gray-800">{client.stats.followers}</p>
                </div>
            </div>

            {/* Platforms Footer */}
            <div className="mt-auto border-t border-gray-50 pt-4 flex flex-col space-y-4">
                <div>
                    <p className="text-xs text-gray-400 mb-2 font-medium">Connected Platforms</p>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(client.platforms).map(([key, data]) => (
                            <PlatformIcon key={key} platform={key} connected={data.connected} />
                        ))}
                        {/* Mocking some unconnected ones for visuals if not present in data */}
                        {['tiktok', 'pinterest'].map(p => (
                            !client.platforms[p] && <PlatformIcon key={p} platform={p} connected={false} />
                        ))}
                    </div>
                    <ConnectionBadges connections={client.connections} />
                </div>

                <Button
                    variant="secondary"
                    className="w-full text-sm py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent double triggering if card is also clickable
                        if (onManage) onManage();
                    }}
                >
                    Manage Client
                </Button>
            </div>
        </motion.div>
    );
}
