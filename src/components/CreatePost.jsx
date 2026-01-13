import { useState } from "react";

export function CreatePost() {
    const [caption, setCaption] = useState("");
    const [hashtags, setHashtags] = useState("");
    const [media, setMedia] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);

    // Social Media Accounts State
    const [socialAccounts, setSocialAccounts] = useState([
        {
            id: 'instagram',
            name: 'Instagram',
            connected: false,
            username: '@yourusername',
            color: 'from-yellow-400 via-pink-500 to-purple-600',
            icon: (
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            )
        },
        {
            id: 'facebook',
            name: 'Facebook',
            connected: false,
            username: null,
            color: 'from-blue-600 to-blue-700',
            icon: (
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            )
        },
        {
            id: 'twitter',
            name: 'Twitter/X',
            connected: false,
            username: null,
            color: 'from-gray-800 to-black',
            icon: (
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            )
        },
        {
            id: 'linkedin',
            name: 'LinkedIn',
            connected: false,
            username: 'Your Name',
            color: 'from-blue-600 to-blue-800',
            icon: (
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            )
        },
    ]);

    const handleConnectAccount = (accountId) => {
        // Get environment variables or use placeholders
        const FACEBOOK_CLIENT_ID = import.meta.env.VITE_FACEBOOK_CLIENT_ID || 'YOUR_FACEBOOK_APP_ID';
        const INSTAGRAM_CLIENT_ID = import.meta.env.VITE_INSTAGRAM_CLIENT_ID || 'YOUR_INSTAGRAM_CLIENT_ID';
        const LINKEDIN_CLIENT_ID = import.meta.env.VITE_LINKEDIN_CLIENT_ID || 'YOUR_LINKEDIN_CLIENT_ID';
        const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || window.location.origin + '/auth/callback';

        // ye Redirect hoga official social media connection page pe and user ko login krna hoga 
        const authUrls = {
            'instagram': `https://api.instagram.com/oauth/authorize?client_id=${INSTAGRAM_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=user_profile,user_media&response_type=code`,
            'facebook': `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FACEBOOK_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=pages_manage_posts,publish_video,pages_read_engagement&response_type=code`,
            'twitter': 'https://twitter.com/i/flow/login',
            'linkedin': `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=w_member_social`,
        };

        const url = authUrls[accountId];
        if (url) {
            // blank isliye ke new window open ho for OAuth flow
            window.open(url, '_blank', 'width=600,height=700');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Simulate posting
        if (caption && media) {
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
            setShowError(true);
            setShowSuccess(false);
            setTimeout(() => setShowError(false), 3000);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            setMedia(files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setMedia(e.target.files[0]);
        }
    };

    return (
        <section className="bg-[#f3f4f6] min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-white rounded-lg shadow-lg">
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
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Hashtags:
                        </label>
                        <input
                            type="text"
                            placeholder="#hashtags (e.g. #socialmedia #marketing)"
                            value={hashtags}
                            onChange={(e) => setHashtags(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400"
                        />
                    </div>

                    {/* Upload Media */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Upload Media:
                        </label>
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-300 bg-gray-50"
                                }`}
                        >
                            <div className="flex flex-col items-center justify-center space-y-3">
                                {/* Icon */}
                                <svg
                                    className="w-12 h-12 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>

                                <div>
                                    <span className="text-gray-600">Drag & drop or </span>
                                    <label className="text-blue-600 font-semibold cursor-pointer hover:text-blue-700">
                                        Browse
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            accept="image/*,video/*"
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                <p className="text-sm text-gray-500">Image or Video file</p>

                                {media && (
                                    <p className="text-sm text-green-600 font-medium mt-2">
                                        ✓ {media.name}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Social Media Connectivity Section */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                            Manage Connected Accounts:
                        </label>
                        <div className="space-y-3">
                            {socialAccounts.map((account) => (
                                <div
                                    key={account.id}
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        {/* Platform Icon */}
                                        <div className={`w-10 h-10 bg-gradient-to-tr ${account.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                {account.icon}
                                            </svg>
                                        </div>

                                        {/* Platform Info */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900">
                                                {account.name}
                                            </h3>
                                            {account.connected ? (
                                                <p className="text-xs text-green-600 font-medium flex items-center">
                                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    Connected • {account.username}
                                                </p>
                                            ) : (
                                                <p className="text-xs text-gray-500">
                                                    Not connected
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Connect/Disconnect Button */}
                                    {account.connected ? (
                                        <button
                                            type="button"
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                            onClick={() => {
                                                // Handle disconnect
                                                setSocialAccounts(prev =>
                                                    prev.map(acc =>
                                                        acc.id === account.id
                                                            ? { ...acc, connected: false, username: null }
                                                            : acc
                                                    )
                                                );
                                            }}
                                        >
                                            Disconnect
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                                            onClick={() => handleConnectAccount(account.id)}
                                        >
                                            Connect
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Select Platforms to Post */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                            Select Platforms to Post:
                        </label>
                        <div className="space-y-2">
                            {socialAccounts
                                .filter(account => account.connected)
                                .map((account) => (
                                    <div key={account.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                                        <input
                                            type="checkbox"
                                            id={`post-${account.id}`}
                                            defaultChecked={account.id === 'instagram'}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor={`post-${account.id}`} className="flex items-center cursor-pointer flex-1">
                                            <div className={`w-8 h-8 bg-gradient-to-tr ${account.color} rounded-lg flex items-center justify-center mr-3`}>
                                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                    {account.icon}
                                                </svg>
                                            </div>
                                            <div>
                                                <span className="text-gray-900 font-medium text-sm">{account.name}</span>
                                                <p className="text-xs text-gray-500">{account.username}</p>
                                            </div>
                                        </label>
                                    </div>
                                ))}
                            {socialAccounts.filter(account => account.connected).length === 0 && (
                                <p className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg">
                                    No connected accounts. Please connect at least one account above to post.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Post Button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Post
                    </button>

                    {/* Success Message */}
                    {showSuccess && (
                        <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg p-4">
                            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-green-800 font-medium">Posted Successfully to Selected Platforms!</span>
                        </div>
                    )}

                    {/* Error Message */}
                    {showError && (
                        <div className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded-lg p-4">
                            <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-red-800 font-medium">Failed to Post. Please fill in all required fields.</span>
                        </div>
                    )}
                </form>
            </div>
        </section>
    );
}