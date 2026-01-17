import { useState } from "react";
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

    // Social Media Accounts State - Should ideally come from Global State/Context now
    // For now, mocking connected state as if fetched from DB
    const [socialAccounts, setSocialAccounts] = useState([
        {
            id: 'instagram',
            name: 'Instagram',
            connected: true,
            username: '@demo_user',
            color: 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600',
            icon: <FaInstagram />
        },
        {
            id: 'facebook',
            name: 'Facebook',
            connected: true,
            username: 'Demo User',
            color: 'bg-blue-600',
            icon: <FaFacebookF />
        },
        {
            id: 'visited', // just a placeholder for unconnected
            name: 'Twitter',
            connected: false,
            username: null,
            color: 'bg-black',
            icon: <FaTwitter />
        }
    ]);

    // Selection state for posting
    const [selectedPlatforms, setSelectedPlatforms] = useState(
        socialAccounts.filter(a => a.connected).map(a => a.id)
    );

    const togglePlatform = (id) => {
        setSelectedPlatforms(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Simulate posting with backend integration
        if (caption && media && selectedPlatforms.length > 0) {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

                // Note: For real file uploads, we would use FormData. 
                // For this secure logic demo, we are sending metadata to verify the protected API call.
                const response = await fetch(`${API_URL}/api/posts/create`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        caption,
                        hashtags,
                        mediaName: media.name,
                        platforms: selectedPlatforms
                    })
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
                    }, 3000);
                } else {
                    throw new Error('Backend rejected post');
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

    const connectedAccounts = socialAccounts.filter(a => a.connected);

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

                    {/* Post Button */}
                    <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                    >
                        Post Now
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