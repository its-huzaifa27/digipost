import React, { useState, useEffect, useMemo } from 'react';
import { FaInstagram, FaFacebook, FaChartLine, FaUsers, FaEye, FaSpinner, FaTriangleExclamation, FaThumbsUp, FaUserGroup, FaArrowUpRightFromSquare, FaFileLines, FaVideo, FaImage, FaClone } from 'react-icons/fa6';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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

    const viewsData = insights?.insights?.find(i => i.name === 'views');
    const totalViews = viewsData?.values?.[0]?.value || 0;

    // Extract breakdown if available
    const breakdown = viewsData?.values?.[0]?.breakdowns?.[0]?.results || [];
    const followersViews = breakdown.find(b => b.dimension_values?.[0] === 'follower')?.value || 0;
    const nonFollowersViews = breakdown.find(b => b.dimension_values?.[0] === 'non_follower')?.value || 0;

    const followerPercentage = totalViews > 0 ? (followersViews / totalViews * 100).toFixed(1) : 0;
    const nonFollowerPercentage = totalViews > 0 ? (nonFollowersViews / totalViews * 100).toFixed(1) : 100;

    const reachValue = insights?.insights?.find(i => i.name === 'reach')?.values?.[0]?.value || 0;

    // Process Demographic Data for Charts
    const demoData = insights?.insights?.find(i => i.name === 'follower_demographics')?.values?.[0]?.value || {};

    const ageData = useMemo(() => {
        const ages = ['13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
        return ages.map(age => {
            const m = demoData[`M.${age}`] || 0;
            const f = demoData[`F.${age}`] || 0;
            const u = demoData[`U.${age}`] || 0;
            return { name: age, value: m + f + u };
        });
    }, [demoData]);

    const genderData = useMemo(() => {
        const m = Object.keys(demoData).filter(k => k.startsWith('M.')).reduce((sum, k) => sum + demoData[k], 0);
        const f = Object.keys(demoData).filter(k => k.startsWith('F.')).reduce((sum, k) => sum + demoData[k], 0);
        const u = Object.keys(demoData).filter(k => k.startsWith('U.')).reduce((sum, k) => sum + demoData[k], 0);
        return [
            { name: 'Men', value: m, color: '#3b82f6' },
            { name: 'Women', value: f, color: '#ec4899' },
            { name: 'Unknown', value: u, color: '#94a3b8' }
        ];
    }, [demoData]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <FaSpinner className="animate-spin text-3xl text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8 bg-[#f8fafc] min-h-screen p-4 md:p-8 text-slate-900 rounded-3xl">
            {/* Reports Header */}
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <FaFileLines className="text-xl" />
                </div>
                <h1 className="text-xl font-bold text-slate-800">Reports</h1>
            </div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold">Account insights</h1>
                </div>

                <div className="flex items-center gap-4">
                    {connections.length > 1 && (
                        <div className="relative">
                            <select
                                className="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-50 transition-colors text-slate-700"
                                value={selectedConnection?.id}
                                onChange={(e) => setSelectedConnection(connections.find(c => c.id === e.target.value))}
                            >
                                {connections.map(c => (
                                    <option key={c.id} value={c.id}>{c.pageName}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('instagram')}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'instagram' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <FaInstagram className="text-lg" />
                        </button>
                        <button
                            onClick={() => setActiveTab('facebook')}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'facebook' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <FaFacebook className="text-lg" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Publishing Behavior Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="font-bold text-slate-800">Publishing Behavior</h2>
                    <div className="flex gap-12 text-xs font-bold text-slate-500 uppercase tracking-wider mr-4">
                        <span>Totals</span>
                        <span className="w-20 text-right">% Change</span>
                    </div>
                </div>
                <div className="divide-y divide-slate-100">
                    {[
                        { label: 'Total Published Posts', value: insights?.publishingSummary?.total || 0, icon: <FaFileLines />, color: 'text-blue-500' },
                        { label: 'Published Videos', value: insights?.publishingSummary?.videos || 0, icon: <FaVideo />, color: 'text-purple-500' },
                        { label: 'Published Photos', value: insights?.publishingSummary?.photos || 0, icon: <FaImage />, color: 'text-pink-500' },
                        { label: 'Published Carousel', value: insights?.publishingSummary?.carousels || 0, icon: <FaClone />, color: 'text-orange-500' },
                    ].map((row, i) => (
                        <div key={i} className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <span className={`${row.color} opacity-70 group-hover:opacity-100 transition-opacity`}>{row.icon}</span>
                                <span className="text-sm font-medium text-slate-700 underline decoration-slate-200 underline-offset-4 cursor-pointer hover:text-blue-600 transition-colors">{row.label}</span>
                            </div>
                            <div className="flex gap-12 items-center mr-4">
                                <span className="font-bold text-slate-900">{isFetchingInsights ? '...' : row.value}</span>
                                <span className="w-20 text-right text-xs font-medium text-slate-400">0%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Engagement depth (Last 30 days) */}
            <div className="space-y-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Engagement depth (Last 30 days)</h2>
                    <p className="text-xs text-slate-500">Review your audience demographics as of the last day of the reporting period.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Age Group Chart */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-center text-sm font-bold text-slate-700 mb-8 font-serif">Engaged Audience vs Followers by Age Group</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={ageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                    <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-col items-center justify-center mt-4 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                            <span className="[writing-mode:vertical-lr] rotate-180 -translate-x-12 absolute">People</span>
                        </div>
                    </div>

                    {/* Gender Chart */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-center text-sm font-bold text-slate-700 mb-8 font-serif">Engaged Audience vs Followers by Gender</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={genderData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                    <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                                        {genderData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
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
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:ring-1 ring-pink-500/10 transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-pink-50 text-pink-500 rounded-2xl group-hover:scale-110 transition-transform">
                                    <FaUsers className="text-xl" />
                                </div>
                                <span className="text-xs font-bold text-pink-500 bg-pink-50 px-2 py-1 rounded-full">+12%</span>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-slate-500 text-sm font-medium">Total Followers</h3>
                                <p className="text-3xl font-bold text-slate-900">
                                    {isFetchingInsights ? <FaSpinner className="animate-spin" /> : (insights?.profile?.followers_count || 0).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:ring-1 ring-blue-500/10 transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl group-hover:scale-110 transition-transform">
                                    <FaChartLine className="text-xl" />
                                </div>
                                <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-full">Today</span>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-slate-500 text-sm font-medium">Account Reach</h3>
                                <p className="text-3xl font-bold text-slate-900">
                                    {isFetchingInsights ? <FaSpinner className="animate-spin" /> : reachValue.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:ring-1 ring-emerald-500/10 transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl group-hover:scale-110 transition-transform">
                                    <FaUsers className="text-xl" />
                                </div>
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Today</span>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-slate-500 text-sm font-medium">New Followers</h3>
                                <p className="text-3xl font-bold text-slate-900">
                                    {isFetchingInsights ? <FaSpinner className="animate-spin" /> : (insights?.insights?.find(i => i.name === 'follower_count')?.values[0]?.value || 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Views Section (Detailed Analytics) */}
                    <div className="bg-white p-8 rounded-[32px] border border-slate-200 space-y-8 shadow-sm">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-slate-800">Views</h2>
                            <FaUserGroup className="text-slate-400 text-sm cursor-help" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Left Side: Stats */}
                            <div className="space-y-8">
                                <div className="space-y-1">
                                    <p className="text-5xl font-bold text-slate-900">{totalViews}</p>
                                    <p className="text-slate-400 text-sm font-medium">Views</p>
                                </div>

                                <div className="space-y-6 max-w-xs">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600 text-sm">Followers</span>
                                        <span className="font-bold text-slate-800">{followerPercentage}%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600 text-sm">Non-followers</span>
                                        <span className="font-bold text-slate-800">{nonFollowerPercentage}%</span>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                        <span className="text-slate-600 text-sm">Accounts reached</span>
                                        <span className="font-bold text-slate-800">{reachValue}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Breakdown Chart Lookalike */}
                            <div className="space-y-8 border-l border-slate-100 pl-0 lg:pl-12">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-slate-400">By content type</h3>
                                    <div className="flex gap-2">
                                        {['All', 'Followers', 'Non-followers'].map(label => (
                                            <button
                                                key={label}
                                                onClick={() => setContentTypeFilter(label)}
                                                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${contentTypeFilter === label ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-slate-600 font-medium">Posts</span>
                                            <span className="text-slate-400 font-bold">100.0%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: '100%' }}></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 pt-4">
                                        <div className="flex items-center gap-2 text-xs">
                                            <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                                            <span className="text-slate-500 font-medium">Followers</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                            <span className="text-slate-500 font-medium">Non-followers</span>
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
                                <h2 className="text-xl font-bold text-slate-800">Recent posts</h2>
                                <p className="text-slate-400 text-sm font-medium">Review your recent posts published during the selected time period.</p>
                            </div>
                            <button className="bg-white text-slate-900 border border-slate-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm">Show all posts</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {isFetchingInsights ? (
                                Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="bg-white rounded-3xl p-5 border border-slate-200 h-[500px] animate-pulse"></div>
                                ))
                            ) : (
                                insights?.topMedia?.map((media) => {
                                    // Calculate Total Engagements
                                    const totalEngagements = (media.like_count || 0) + (media.comments_count || 0) + (media.saved || 0); // Shares not available yet

                                    return (
                                        <div key={media.id} className="bg-white rounded-3xl p-5 border border-slate-200 flex flex-col h-full hover:ring-1 ring-blue-500/10 transition-all shadow-sm">
                                            {/* Media Thumbnail */}
                                            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 mb-4 group shadow-inner">
                                                {media.media_type === 'VIDEO' || media.media_product_type === 'REELS' ? (
                                                    <div className="relative w-full h-full">
                                                        <img
                                                            src={media.thumbnail_url || media.media_url}
                                                            alt="Video thumbnail"
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                                                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                                                                <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-12 border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                                                            </div>
                                                        </div>
                                                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-white border border-white/20 tracking-wider">REEL</div>
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
                                            <div className="flex items-start justify-between gap-3 mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                                        {insights?.profile?.profile_picture_url ? (
                                                            <img src={insights.profile.profile_picture_url} alt="Profile" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                                <FaUsers />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-sm leading-tight text-slate-800">{insights?.profile?.name || 'Unknown User'}</h3>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
                                                            {new Date(media.timestamp).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                                            <span className="mx-1">•</span>
                                                            {new Date(media.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <a
                                                    href={media.permalink || '#'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-slate-200"
                                                >
                                                    <FaArrowUpRightFromSquare className="text-xs" />
                                                </a>
                                            </div>

                                            {/* Caption */}
                                            <div className="mb-6 grow">
                                                <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed font-serif">
                                                    {media.caption || 'No caption provided.'}
                                                </p>
                                            </div>

                                            {/* Stats */}
                                            <div className="mt-auto space-y-4 pt-4 border-t border-slate-100">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Engagements</span>
                                                    <span className="text-xl font-black text-slate-900">{totalEngagements.toLocaleString()}</span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-[11px] font-bold uppercase tracking-tight">
                                                    <div className="flex justify-between items-center group cursor-pointer">
                                                        <span className="text-slate-400 group-hover:text-blue-600 transition-colors">Likes</span>
                                                        <span className="text-slate-700">{(media.like_count || 0).toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center group cursor-pointer">
                                                        <span className="text-slate-400 group-hover:text-blue-600 transition-colors">Comments</span>
                                                        <span className="text-slate-700">{(media.comments_count || 0).toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center group cursor-pointer">
                                                        <span className="text-slate-400 group-hover:text-blue-600 transition-colors">Saves</span>
                                                        <span className="text-slate-700">{(media.saved || 0).toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center group cursor-pointer">
                                                        <span className="text-slate-400 group-hover:text-blue-600 transition-colors">Views</span>
                                                        <span className="text-slate-700">{(media.views || 0).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            {(!isFetchingInsights && (!insights?.topMedia || insights.topMedia.length === 0)) && (
                                <div className="col-span-full h-48 flex items-center justify-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
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
