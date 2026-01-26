import React, { useState, useEffect } from 'react';
import { FaInstagram, FaFacebook, FaChartLine, FaUsers, FaEye, FaSpinner, FaTriangleExclamation, FaThumbsUp, FaUserGroup, FaArrowUpRightFromSquare } from 'react-icons/fa6';

export function AnalyticsContent() {
    const [activeTab, setActiveTab] = useState('instagram'); // 'instagram' | 'facebook'
    const [connections, setConnections] = useState([]);
    const [selectedConnection, setSelectedConnection] = useState(null);
    const [insights, setInsights] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingInsights, setIsFetchingInsights] = useState(false);
    const [error, setError] = useState(null);
    const [contentTypeFilter, setContentTypeFilter] = useState('All');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const token = localStorage.getItem('token');
    const storedClient = JSON.parse(localStorage.getItem('selectedClient') || '{}');

    useEffect(() => {
        fetchConnections();
    }, [storedClient.id, activeTab]);

    const fetchConnections = async () => {
        if (!storedClient.id) return;
        setIsLoading(true);
        setConnections([]);
        setSelectedConnection(null);
        setInsights(null);

        try {
            const response = await fetch(`${API_URL}/api/meta/pages?clientId=${storedClient.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                const filtered = data.filter(c => c.platform === activeTab);
                setConnections(filtered);
                if (filtered.length > 0) {
                    setSelectedConnection(filtered[0]);
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
            <div className="flex items-center justify-center min-h-[400px]">
                <FaSpinner className="animate-spin text-3xl text-blue-500" />
            </div>
        );
    }

    const viewsData = insights?.insights?.find(i => i.name === 'views');
    const totalViews = viewsData?.values?.[0]?.value || 0;

    // Extract breakdown if available
    const breakdown = viewsData?.values?.[0]?.breakdowns?.[0]?.results || [];
    const followersViews = breakdown.find(b => b.dimension_values?.[0] === 'follower')?.value || 0;
    const nonFollowersViews = breakdown.find(b => b.dimension_values?.[0] === 'non_follower')?.value || 0;

    const followerPercentage = totalViews > 0 ? (followersViews / totalViews * 100).toFixed(1) : 0;
    const nonFollowerPercentage = totalViews > 0 ? (nonFollowersViews / totalViews * 100).toFixed(1) : 100;

    const reachValue = insights?.insights?.find(i => i.name === 'reach')?.values?.[0]?.value || 0;

    return (
        <div className="space-y-8 bg-gray-600 min-h-screen p-4 md:p-8 text-white rounded-3xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold">Account insights</h1>
                </div>

                <div className="flex items-center gap-4">
                    {connections.length > 1 && (
                        <div className="relative">
                            <select
                                className="appearance-none bg-[#1c1c1e] border border-gray-800 rounded-xl pl-4 pr-10 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer hover:bg-[#2c2c2e] transition-colors"
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

                    <div className="flex gap-2 bg-[#1c1c1e] p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('instagram')}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'instagram' ? 'bg-[#3a3a3c] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <FaInstagram className="text-lg" />
                        </button>
                        <button
                            onClick={() => setActiveTab('facebook')}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'facebook' ? 'bg-[#3a3a3c] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <FaFacebook className="text-lg" />
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-400">
                    <FaTriangleExclamation />
                    <span>{error}</span>
                </div>
            )}

            {connections.length === 0 ? (
                <div className="bg-[#1c1c1e] rounded-3xl border border-dashed border-gray-800 p-12 text-center space-y-4">
                    <div className={`w-16 h-16 bg-[#2c2c2e] rounded-full flex items-center justify-center mx-auto text-gray-500`}>
                        {activeTab === 'instagram' ? <FaInstagram className="text-3xl" /> : <FaFacebook className="text-3xl" />}
                    </div>
                    <h3 className="text-lg font-bold">No {activeTab === 'instagram' ? 'Instagram' : 'Facebook'} Accounts Connected</h3>
                    <p className="text-gray-400 max-w-sm mx-auto">
                        Connect a {activeTab === 'instagram' ? 'Instagram Business' : 'Facebook Page'} account in the Dashboard to see analytics here.
                    </p>
                </div>
            ) : (
                <div className="space-y-12">
                    {/* High-level Stat Cards (Old part restored) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-[#1c1c1e] p-6 rounded-3xl border border-gray-800 shadow-sm hover:ring-1 ring-pink-500/30 transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-pink-500/10 text-pink-500 rounded-2xl group-hover:scale-110 transition-transform">
                                    <FaUsers className="text-xl" />
                                </div>
                                <span className="text-xs font-bold text-pink-500 bg-pink-500/10 px-2 py-1 rounded-full">+12%</span>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-gray-400 text-sm font-medium">Total Followers</h3>
                                <p className="text-3xl font-bold">
                                    {isFetchingInsights ? <FaSpinner className="animate-spin" /> : (insights?.profile?.followers_count || 0).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="bg-[#1c1c1e] p-6 rounded-3xl border border-gray-800 shadow-sm hover:ring-1 ring-blue-500/30 transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl group-hover:scale-110 transition-transform">
                                    <FaChartLine className="text-xl" />
                                </div>
                                <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded-full">Today</span>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-gray-400 text-sm font-medium">Account Reach</h3>
                                <p className="text-3xl font-bold">
                                    {isFetchingInsights ? <FaSpinner className="animate-spin" /> : reachValue.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="bg-[#1c1c1e] p-6 rounded-3xl border border-gray-800 shadow-sm hover:ring-1 ring-green-500/30 transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-green-500/10 text-green-500 rounded-2xl group-hover:scale-110 transition-transform">
                                    <FaUsers className="text-xl" />
                                </div>
                                <span className="text-xs font-bold text-green-600 bg-green-500/10 px-2 py-1 rounded-full">Today</span>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-gray-400 text-sm font-medium">New Followers</h3>
                                <p className="text-3xl font-bold">
                                    {isFetchingInsights ? <FaSpinner className="animate-spin" /> : (insights?.insights?.find(i => i.name === 'follower_count')?.values[0]?.value || 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Views Section (Detailed Analytics) */}
                    <div className="bg-[#1c1c1e] p-8 rounded-[40px] border border-gray-800 space-y-8">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold">Views</h2>
                            <FaUserGroup className="text-gray-500 text-sm cursor-help" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Left Side: Stats */}
                            <div className="space-y-8">
                                <div className="space-y-1">
                                    <p className="text-5xl font-bold">{totalViews}</p>
                                    <p className="text-gray-500 text-sm">Views</p>
                                </div>

                                <div className="space-y-6 max-w-xs">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-300">Followers</span>
                                        <span className="font-bold">{followerPercentage}%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-300">Non-followers</span>
                                        <span className="font-bold">{nonFollowerPercentage}%</span>
                                    </div>

                                    <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
                                        <span className="text-gray-300">Accounts reached</span>
                                        <span className="font-bold">{reachValue}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Breakdown Chart Lookalike */}
                            <div className="space-y-8 border-l border-gray-800 pl-0 lg:pl-12">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-400">By content type</h3>
                                    <div className="flex gap-2">
                                        {['All', 'Followers', 'Non-followers'].map(label => (
                                            <button
                                                key={label}
                                                onClick={() => setContentTypeFilter(label)}
                                                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${contentTypeFilter === label ? 'bg-indigo-600 text-white' : 'bg-[#1c1c1e] text-gray-400'}`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span>Posts</span>
                                            <span className="text-gray-400">100.0%</span>
                                        </div>
                                        <div className="h-2 w-full bg-[#1c1c1e] rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: '100%' }}></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 pt-4">
                                        <div className="flex items-center gap-2 text-xs">
                                            <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                                            <span className="text-gray-400">Followers</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                            <span className="text-gray-400">Non-followers</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Posts Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold">Recent posts</h2>
                                <p className="text-gray-400 text-sm">Review your recent posts published during the selected time period.</p>
                            </div>
                            <button className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors">Show all posts</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {isFetchingInsights ? (
                                Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="bg-[#1c1c1e] rounded-3xl p-5 border border-gray-800 h-[500px] animate-pulse"></div>
                                ))
                            ) : (
                                insights?.topMedia?.map((media) => {
                                    // Calculate Total Engagements
                                    const totalEngagements = (media.like_count || 0) + (media.comments_count || 0) + (media.saved || 0); // Shares not available yet

                                    return (
                                        <div key={media.id} className="bg-[#1c1c1e] rounded-3xl p-5 border border-gray-800 flex flex-col h-full hover:ring-1 ring-gray-700 transition-all">
                                            {/* Media Thumbnail */}
                                            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black mb-4 group">
                                                {media.media_type === 'VIDEO' || media.media_product_type === 'REELS' ? (
                                                    <div className="relative w-full h-full">
                                                        <img
                                                            src={media.thumbnail_url || media.media_url}
                                                            alt="Video thumbnail"
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                                                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                                                <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-10 border-l-white border-b-[6px] border-b-transparent ml-1"></div>
                                                            </div>
                                                        </div>
                                                        <div className="absolute bottom-2 right-2 bg-black/60 px-1.5 py-0.5 rounded text-[10px] font-bold">REEL</div>
                                                    </div>
                                                ) : (
                                                    <img
                                                        src={media.media_url}
                                                        alt={media.caption}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>

                                            {/* Header */}
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden shrink-0">
                                                        {insights?.profile?.profile_picture_url ? (
                                                            <img src={insights.profile.profile_picture_url} alt="Profile" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                <FaUsers />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-sm leading-tight">{insights?.profile?.name || 'Unknown User'}</h3>
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(media.timestamp).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                                                            <span className="mx-1">•</span>
                                                            {new Date(media.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <a
                                                    href={media.permalink || '#'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-gray-500 hover:text-white transition-colors"
                                                >
                                                    <FaArrowUpRightFromSquare className="text-sm" />
                                                </a>
                                            </div>

                                            {/* Caption */}
                                            <div className="mb-6 grow">
                                                <p className="text-sm text-gray-300 line-clamp-3 leading-relaxed">
                                                    {media.caption || 'No caption provided.'}
                                                </p>
                                            </div>

                                            {/* Stats */}
                                            <div className="mt-auto space-y-3">
                                                <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                                                    <span className="text-sm font-medium text-gray-400">Total Engagements</span>
                                                    <span className="text-lg font-bold">{totalEngagements.toLocaleString()}</span>
                                                </div>

                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between items-center group cursor-pointer">
                                                        <span className="text-gray-400 underline decoration-gray-700 group-hover:text-white transition-colors">Likes</span>
                                                        <span className="font-medium text-gray-200">{(media.like_count || 0).toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center group cursor-pointer">
                                                        <span className="text-gray-400 underline decoration-gray-700 group-hover:text-white transition-colors">Comments</span>
                                                        <span className="font-medium text-gray-200">{(media.comments_count || 0).toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center group cursor-pointer">
                                                        <span className="text-gray-400 underline decoration-gray-700 group-hover:text-white transition-colors">Shares</span>
                                                        <span className="font-medium text-gray-200">0</span>
                                                    </div>
                                                    <div className="flex justify-between items-center group cursor-pointer">
                                                        <span className="text-gray-400 underline decoration-gray-700 group-hover:text-white transition-colors">Saves</span>
                                                        <span className="font-medium text-gray-200">{(media.saved || 0).toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center group cursor-pointer">
                                                        <span className="text-gray-400 underline decoration-gray-700 group-hover:text-white transition-colors">Views</span>
                                                        <span className="font-medium text-gray-200">{(media.views || 0).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            {(!isFetchingInsights && (!insights?.topMedia || insights.topMedia.length === 0)) && (
                                <div className="col-span-full h-48 flex items-center justify-center text-gray-500 bg-[#1c1c1e] rounded-2xl border border-dashed border-gray-800">
                                    No posts found for this period.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
