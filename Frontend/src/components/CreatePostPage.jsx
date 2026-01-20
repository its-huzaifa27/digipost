import { useState, useEffect } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Card } from "./ui/Card";
import { MediaUploader } from "./features/create-post/MediaUploader";
import { FaInstagram, FaFacebookF, FaTwitter, FaLinkedinIn } from 'react-icons/fa6';

export function CreatePostPage() {
    const [caption, setCaption] = useState("");
    const [hashtags, setHashtags] = useState("");
    const [media, setMedia] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);

    const [socialAccounts, setSocialAccounts] = useState([]);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);

    // Fetch Connected Accounts from Backend
    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const token = localStorage.getItem('token');

                const response = await fetch(`${API_URL}/api/meta/pages`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const pages = await response.json();

                    // Transform backend data to match UI component structure
                    const formattedAccounts = pages.map(page => ({
                        id: page.platform, // 'facebook' or 'instagram'
                        name: page.pageName || page.platform,
                        connected: true,
                        username: page.platformUserId || 'Connected',
                        color: page.platform === 'instagram' ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600' : 'bg-blue-600',
                        icon: page.platform === 'instagram' ? <FaInstagram /> : <FaFacebookF />
                    }));

                    setSocialAccounts(formattedAccounts);

                    // Auto-select all connected
                    setSelectedPlatforms(formattedAccounts.map(a => a.id));
                }
            } catch (error) {
                console.error("Failed to fetch accounts:", error);
            } finally {
                setIsLoadingAccounts(false);
            }
        };

        fetchAccounts();
    }, []);

    // Selection state for posting
    const [selectedPlatforms, setSelectedPlatforms] = useState([]);

    const togglePlatform = (id) => {
        setSelectedPlatforms(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const [isScheduled, setIsScheduled] = useState(false);
    const [scheduledDate, setScheduledDate] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (caption && selectedPlatforms.length > 0) {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const token = localStorage.getItem('token');

                // Create FormData for file upload
                const formData = new FormData();
                formData.append('caption', caption);
                formData.append('platforms', JSON.stringify(selectedPlatforms));

                // Append media file if exists
                if (media) {
                    formData.append('media', media);
                }

                // If scheduled, convert to Unix timestamp (seconds)
                if (isScheduled && scheduledDate) {
                    const timestamp = Math.floor(new Date(scheduledDate).getTime() / 1000);
                    formData.append('scheduledTime', timestamp);
                }

                const response = await fetch(`${API_URL}/api/posts/create`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                        // Content-Type is set automatically by browser for FormData
                    },
                    body: formData
                });

                if (response.ok) {
                    setShowSuccess(true);
                    setShowError(false);
                    // Reset form after 3 seconds
                    setTimeout(() => {
                        setShowSuccess(false);
                        setCaption("");
                        setHashtags("");
                        setMedia(null);
                        setIsScheduled(false);
                        setScheduledDate("");
                    }, 3000);
                } else {
                    const data = await response.json();
                    throw new Error(data.error || 'Backend rejected post');
                }
            } catch (error) {
                console.error("Post creation failed:", error);
                setShowError(true);
                setShowSuccess(false);
                setTimeout(() => setShowError(false), 3000);
            }
        } else {
            setShowError(true);
            setShowSuccess(false);
            setTimeout(() => setShowError(false), 3000);
        }
    };

    const connectedAccounts = socialAccounts; // They are already filtered in valid state logic usually, or just show all fetching ones

    return (
        <section className="bg-[#f3f4f6] min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-xl">
                {/* Header */}
                <div className="border-b border-gray-200 px-8 py-4">
                    <h1 className="text-2xl font-bold text-gray-900 text-center">
                        Create Post
                    </h1>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Caption Field */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Caption:
                        </label>
                        <textarea
                            placeholder="Write your caption here..."
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            rows="2"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-700 placeholder-gray-400"
                        />
                    </div>

                    {/* Hashtags Field */}
                    <Input
                        label="Hashtags:"
                        placeholder="#hashtags (e.g. #socialmedia #marketing)"
                        value={hashtags}
                        onChange={(e) => setHashtags(e.target.value)}
                    />

                    {/* Upload Media */}
                    <MediaUploader
                        media={media}
                        onFileChange={setMedia}
                        onDrop={setMedia}
                    />

                    {/* Post Destination Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Publish to:</label>
                        {connectedAccounts.length > 0 ? (
                            <div className="space-y-2">
                                {connectedAccounts.map(account => (
                                    <div
                                        key={account.id}
                                        className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all ${selectedPlatforms.includes(account.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                                        onClick={() => togglePlatform(account.id)}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${account.color}`}>
                                            {account.icon}
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-sm font-medium text-gray-900 block">{account.name}</span>
                                            <span className="text-xs text-gray-500">{account.username}</span>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedPlatforms.includes(account.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                                            {selectedPlatforms.includes(account.id) && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-200">
                                No connected accounts found. Please go to the Dashboard to connect your social media profiles.
                            </div>
                        )}
                    </div>

                    {/* Publishing Options */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-900">Publishing Options:</label>
                        <div className="flex space-x-4">
                            <button
                                type="button"
                                onClick={() => setIsScheduled(false)}
                                className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-all ${!isScheduled ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'}`}
                            >
                                Post Now
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsScheduled(true)}
                                className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-all ${isScheduled ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'}`}
                            >
                                Schedule
                            </button>
                        </div>

                        {isScheduled && (
                            <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                                    Scheduled Time:
                                </label>
                                <input
                                    type="datetime-local"
                                    value={scheduledDate}
                                    onChange={(e) => setScheduledDate(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                                    min={new Date(Date.now() + 10 * 60 * 1000).toISOString().slice(0, 16)} // Min 10 mins from now
                                />
                                <p className="text-[10px] text-gray-400 mt-1 italic">
                                    * Scheduling must be at least 10 minutes in advance.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Post Button */}
                    <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                    >
                        {isScheduled ? 'Schedule Post' : 'Post Now'}
                    </Button>

                    {/* Success Message */}
                    {showSuccess && (
                        <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg p-4">
                            <span className="text-green-800 font-medium">Posted Successfully!</span>
                        </div>
                    )}

                    {/* Error Message */}
                    {showError && (
                        <div className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded-lg p-4">
                            <span className="text-red-800 font-medium">Failed to Post. Check caption, media, and platform selection.</span>
                        </div>
                    )}
                </form>
            </Card>
        </section>
    );
}