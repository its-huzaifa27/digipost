import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { apiFetch } from '../../utils/api';
import { format } from 'date-fns';
import { IoMdTrash } from "react-icons/io";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter, FaFilter } from "react-icons/fa";

export function ScheduledPosts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPlatform, setSelectedPlatform] = useState('all');

    useEffect(() => {
        fetchScheduledPosts();
    }, []);

    const fetchScheduledPosts = async () => {
        try {
            const selectedClientRaw = localStorage.getItem('selectedClient');
            const selectedClient = selectedClientRaw ? JSON.parse(selectedClientRaw) : null;
            const clientId = selectedClient?.id || 'all';

            const data = await apiFetch(`/api/posts/scheduled?clientId=${clientId}`);
            setPosts(data);
        } catch (err) {
            console.error("Failed to fetch scheduled posts:", err);
            setError("Failed to load scheduled posts.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelPost = async (postId) => {
        if (!confirm("Are you sure you want to cancel this scheduled post? This action cannot be undone.")) {
            return;
        }

        try {
            await apiFetch(`/api/posts/${postId}`, {
                method: 'DELETE',
            });
            // Update local state
            setPosts(posts.filter(post => post.id !== postId));
        } catch (err) {
            console.error("Failed to cancel post:", err);
            alert("Failed to cancel post. Please try again.");
        }
    };

    const filteredPosts = posts.filter(post => {
        if (selectedPlatform === 'all') return true;

        // Check resolved platform types from backend
        return post.platformTypes && post.platformTypes.includes(selectedPlatform);
    });

    const getPlatformIcon = (platformId) => {
        switch (platformId) {
            case 'facebook': return <FaFacebook className="text-blue-600" />;
            case 'instagram': return <FaInstagram className="text-pink-600" />;
            case 'linkedin': return <FaLinkedin className="text-blue-700" />;
            case 'twitter': return <FaTwitter className="text-sky-500" />;
            default: return <span>📢</span>;
        }
    };

    const platforms = [
        { id: 'all', label: 'All', icon: <FaFilter /> },
        { id: 'facebook', label: 'Facebook', icon: <FaFacebook /> },
        { id: 'instagram', label: 'Instagram', icon: <FaInstagram /> },
        { id: 'linkedin', label: 'LinkedIn', icon: <FaLinkedin /> },
        { id: 'twitter', label: 'Twitter', icon: <FaTwitter /> },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-800 rounded-lg border border-red-200">
                {error}
                <Button variant="outline" size="sm" className="ml-4" onClick={fetchScheduledPosts}>Retry</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 p-1.5 rounded-lg text-lg">📅</span>
                    Scheduled Posts
                </h2>

                <div className="flex flex-wrap gap-2">
                    {platforms.map(platform => (
                        <button
                            key={platform.id}
                            onClick={() => setSelectedPlatform(platform.id)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedPlatform === platform.id
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                }`}
                        >
                            {platform.icon}
                            {platform.label}
                        </button>
                    ))}
                </div>
            </div>

            {filteredPosts.length === 0 ? (
                <div className="text-center p-12 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-3xl">
                        📅
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">No Scheduled Posts</h3>
                    <p className="text-gray-500 max-w-sm mt-1 mb-6">
                        {selectedPlatform === 'all'
                            ? "You don't have any posts scheduled for the future."
                            : `No scheduled posts found for ${platforms.find(p => p.id === selectedPlatform)?.label}.`}
                    </p>
                    {selectedPlatform === 'all' && (
                        <Button onClick={() => window.location.href = '/create-post'}>
                            Schedule a Post
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredPosts.map(post => (
                        <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-gray-200 group">
                            <div className="relative h-48 bg-gray-100">
                                {post.mediaUrl ? (
                                    post.mediaType === 'video' ? (
                                        <video src={post.mediaUrl} className="w-full h-full object-cover" />
                                    ) : (
                                        <img src={post.mediaUrl} alt="Post media" className="w-full h-full object-cover" />
                                    )
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        No Media
                                    </div>
                                )}

                                <div className="absolute top-3 right-3 flex gap-2">
                                    {post.platformTypes && post.platformTypes.map((platform, idx) => {
                                        return (
                                            <div key={idx} className="w-8 h-8 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center text-lg" title={platform}>
                                                {getPlatformIcon(platform)}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                                    🕒 {format(new Date(post.scheduledAt), 'MMM d, h:mm a')}
                                </div>
                            </div>

                            <div className="p-5">
                                <p className="text-gray-600 text-sm line-clamp-3 mb-4 min-h-[60px]">
                                    {post.content || <em className="text-gray-400">No caption</em>}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                                    <div className="text-xs text-gray-400 font-medium">
                                        {post.Client?.name || 'Unknown Client'}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            Scheduled
                                        </span>
                                        <button
                                            onClick={() => handleCancelPost(post.id)}
                                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                                            title="Cancel Post"
                                        >
                                            <IoMdTrash size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
