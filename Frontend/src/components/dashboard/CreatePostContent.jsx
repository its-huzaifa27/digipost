import { useState, useEffect } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { MediaUploader } from "../features/create-post/MediaUploader";
import { PostPreview } from "../features/create-post/PostPreview";
import { FaInstagram, FaFacebookF, FaTwitter, FaLinkedinIn, FaRobot, FaPen } from 'react-icons/fa6';

export function CreatePostContent() {
    const [creationMode, setCreationMode] = useState("manual"); // 'manual' | 'ai'
    const [aiPrompt, setAiPrompt] = useState("");
    const [caption, setCaption] = useState("");
    const [hashtags, setHashtags] = useState("");
    const [media, setMedia] = useState([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);

    const [socialAccounts, setSocialAccounts] = useState([]);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
    const [selectedPlatforms, setSelectedPlatforms] = useState([]);

    // Fetch Connected Accounts from Backend
    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const token = localStorage.getItem('token');

                // Get selected client
                const selectedClientRaw = localStorage.getItem('selectedClient');
                const selectedClient = selectedClientRaw ? JSON.parse(selectedClientRaw) : null;
                const clientId = selectedClient?.id;

                if (!clientId || clientId === 'all') {
                    // No specific client selected, cannot fetch pages
                    setSocialAccounts([]);
                    setIsLoadingAccounts(false);
                    return;
                }

                const response = await fetch(`${API_URL}/api/meta/pages?clientId=${clientId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const pages = await response.json();

                    // Transform backend data to match UI component structure
                    const formattedAccounts = pages.map(page => ({
                        id: page.id, // Use unique Connection ID (UUID)
                        platformId: page.platform, // Helper for icons/colors
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

    const togglePlatform = (id) => {
        setSelectedPlatforms(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleDisconnect = async (e, connectionId, name) => {
        e.stopPropagation(); // Prevent toggling selection when clicking disconnect
        if (!confirm(`Are you sure you want to disconnect ${name}?`)) return;

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const token = localStorage.getItem('token');
            const selectedClientRaw = localStorage.getItem('selectedClient');
            const selectedClient = selectedClientRaw ? JSON.parse(selectedClientRaw) : null;
            const clientId = selectedClient?.id;

            const response = await fetch(`${API_URL}/api/meta/disconnect`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ clientId, connectionId })
            });

            if (response.ok) {
                // Remove from state
                setSocialAccounts(prev => prev.filter(a => a.id !== connectionId));
                setSelectedPlatforms(prev => prev.filter(id => id !== connectionId));
            } else {
                alert("Failed to disconnect account.");
            }
        } catch (error) {
            console.error("Disconnect failed:", error);
        }
    };

    const [isScheduled, setIsScheduled] = useState(false);
    const [scheduledDate, setScheduledDate] = useState("");



    const handleAiGenerate = async () => {
        if (!aiPrompt.trim()) {
            alert("Please enter a topic or description first.");
            return;
        }

        setIsGeneratingAi(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_URL}/api/ai/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ topic: aiPrompt })
            });

            if (response.ok) {
                const data = await response.json();
                // Data format: { caption, hashtags }
                setCaption(data.caption);
                setHashtags(data.hashtags);
                // Switch back to manual mode to let user review
                setCreationMode('manual');
            } else {
                throw new Error("Failed to generate content");
            }
        } catch (error) {
            console.error("AI Generation Error:", error);
            alert("Failed to generate content. Please try again.");
        } finally {
            setIsGeneratingAi(false);
        }
    };

    const handleImageGenerate = async () => {
        if (!aiPrompt.trim()) {
            alert("Please enter a topic/description for the image first.");
            return;
        }

        setIsGeneratingImage(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_URL}/api/ai/generate-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ prompt: aiPrompt })
            });

            if (response.ok) {
                const data = await response.json();
                // Data format: { image: "data:image/png;base64,..." }

                // Convert Base64 to File object
                const res = await fetch(data.image);
                const blob = await res.blob();
                const file = new File([blob], "ai-generated-image.png", { type: "image/png" });

                // Append to existing media
                setMedia(prev => Array.isArray(prev) ? [...prev, file] : [file]);
                // Switch to manual to see the uploaded image
                setCreationMode('manual');
            } else {
                throw new Error("Failed to generate image");
            }
        } catch (error) {
            console.error("AI Image Generation Error:", error);
            alert("Failed to generate image. Please try again.");
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Convert media state to array for uniform handling
        const currentMedia = Array.isArray(media) ? media : (media ? [media] : []);

        if (caption && selectedPlatforms.length > 0) {
            // Validation: Instagram requires an image
            const hasInstagram = selectedPlatforms.some(id => {
                const account = socialAccounts.find(a => a.id === id);
                return account?.platformId === 'instagram';
            });

            if (hasInstagram && currentMedia.length === 0) {
                alert("Instagram requires at least one image/video. Please upload media.");
                return;
            }

            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const token = localStorage.getItem('token');

                // Get Client ID
                const selectedClientRaw = localStorage.getItem('selectedClient');
                const selectedClient = selectedClientRaw ? JSON.parse(selectedClientRaw) : null;
                const clientId = selectedClient?.id;

                if (!clientId) {
                    throw new Error("No client selected");
                }

                const formData = new FormData();
                // Bug fix: Concatenate hashtags to caption
                const fullCaption = hashtags ? `${caption}\n\n${hashtags}` : caption;
                formData.append('caption', fullCaption);

                formData.append('platforms', JSON.stringify(selectedPlatforms));
                formData.append('clientId', clientId);

                // Append all files
                if (currentMedia.length > 0) {
                    currentMedia.forEach(file => {
                        formData.append('media', file);
                    });
                }

                if (isScheduled && scheduledDate) {
                    const timestamp = Math.floor(new Date(scheduledDate).getTime() / 1000);
                    formData.append('scheduledTime', timestamp);
                }

                const response = await fetch(`${API_URL}/api/posts/create`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (response.ok) {
                    setShowSuccess(true);
                    setShowError(false);
                    setTimeout(() => {
                        setShowSuccess(false);
                        setCaption("");
                        setHashtags("");
                        setMedia([]); // Reset as array
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

    return (
        <div className="w-full mx-auto">
            <div className="p-4 md:p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold text-gray-900">Create New Post</h1>
                        <p className="text-gray-500 text-sm">Draft and publish content across your connected platforms.</p>
                    </div>

                    <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
                        <button
                            type="button"
                            onClick={() => setCreationMode('manual')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${creationMode === 'manual' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <FaPen className="text-xs" />
                            Manual
                        </button>
                        <button
                            type="button"
                            onClick={() => setCreationMode('ai')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${creationMode === 'ai' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <FaRobot className="text-xs" />
                            AI Create
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* LEFT COLUMN: EDITOR */}
                    <div className="space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {creationMode === 'ai' && (
                                <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="flex items-center gap-2 text-purple-700 font-bold mb-1">
                                        <FaRobot />
                                        <span>AI Assistant</span>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            What should this post be about?
                                        </label>
                                        <textarea
                                            placeholder="Enter a topic, describe an image, or provide keywords..."
                                            value={aiPrompt}
                                            onChange={(e) => setAiPrompt(e.target.value)}
                                            rows="3"
                                            className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-700 placeholder-gray-400"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        className="w-full bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-70 disabled:cursor-not-allowed"
                                        onClick={handleAiGenerate}
                                        disabled={isGeneratingAi}
                                    >
                                        {isGeneratingAi ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Magic is happening...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <FaRobot className="mr-2" />
                                                Generate Caption & Hashtags
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        type="button"
                                        className="w-full bg-pink-600 hover:bg-pink-700 text-white disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                                        onClick={handleImageGenerate}
                                        disabled={isGeneratingImage}
                                    >
                                        {isGeneratingImage ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Painting pixels...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <FaPen className="mr-2" />
                                                Generate Image
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Caption:
                                </label>
                                <textarea
                                    placeholder="Write your caption here..."
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    rows="3"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-700 placeholder-gray-400"
                                />
                            </div>

                            <Input
                                label="Hashtags:"
                                placeholder="#hashtags (e.g. #socialmedia #marketing)"
                                value={hashtags}
                                onChange={(e) => setHashtags(e.target.value)}
                            />

                            <MediaUploader
                                media={media}
                                onFileChange={setMedia}
                                onDrop={setMedia}
                            />

                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">Publish to:</label>
                                {socialAccounts.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {socialAccounts.map(account => (
                                            <div
                                                key={account.id}
                                                className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all group ${selectedPlatforms.includes(account.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                                                onClick={() => togglePlatform(account.id)}
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${account.color}`}>
                                                    {account.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-sm font-medium text-gray-900 block truncate">{account.name}</span>
                                                    <span className="text-xs text-gray-500 truncate">{account.username}</span>
                                                </div>

                                                {/* Disconnect Button (Always Visible) */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleDisconnect(e, account.id, account.name)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                                                    title="Disconnect Account"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>

                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${selectedPlatforms.includes(account.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                                                    {selectedPlatforms.includes(account.id) && <div className="w-2 h-2 bg-white rounded-full" />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-200">
                                        No connected accounts found.
                                    </div>
                                )}
                            </div>

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
                                            min={new Date(Date.now() + 10 * 60 * 1000).toISOString().slice(0, 16)}
                                        />
                                    </div>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                            >
                                {isScheduled ? 'Schedule Post' : 'Post Now'}
                            </Button>
                        </form>
                    </div>

                    {/* RIGHT COLUMN: PREVIEW */}
                    <div className="lg:sticky lg:top-8 hidden lg:block">
                        <PostPreview
                            caption={caption}
                            hashtags={hashtags}
                            media={media}
                            clientName={JSON.parse(localStorage.getItem('selectedClient') || '{}').name}
                        />
                    </div>
                    {showSuccess && (
                        <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                            <span className="text-green-800 font-medium">Posted Successfully!</span>
                        </div>
                    )}

                    {showError && (
                        <div className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                            <span className="text-red-800 font-medium">Failed to Post. Check details and try again.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
