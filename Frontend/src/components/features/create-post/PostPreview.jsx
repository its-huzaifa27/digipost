import React, { useState, useEffect, useMemo } from 'react';
import { FaInstagram, FaFacebookF, FaLinkedinIn, FaRegHeart, FaRegComment, FaRegPaperPlane, FaRegBookmark, FaEllipsis, FaThumbsUp, FaShare } from 'react-icons/fa6';
import { clsx } from 'clsx';

export function PostPreview({ caption, hashtags, media, user, clientName }) {
    const [activeTab, setActiveTab] = useState('instagram'); // 'instagram' | 'facebook' | 'linkedin'
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isVideo, setIsVideo] = useState(false);

    // Generate Object URL for preview
    useEffect(() => {
        let objectUrl = null;
        if (media && media.length > 0) {
            const file = media[0]; // Preview first file only for now
            objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
            setIsVideo(file.type.startsWith('video'));
        } else {
            setPreviewUrl(null);
            setIsVideo(false);
        }

        // Cleanup
        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [media]);

    const displayCaption = useMemo(() => {
        if (!caption && !hashtags) return "Your caption will appear here...";
        const fullText = `${caption}\n\n${hashtags}`;
        return fullText;
    }, [caption, hashtags]);

    const formattedDate = "Just now";
    const userName = clientName || "Your Brand";
    const userHandle = userName.toLowerCase().replace(/\s+/g, '') || "brand";

    const TabButton = ({ id, icon, label, color }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={clsx(
                "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all border-b-2",
                activeTab === id
                    ? `border-${color}-600 text-${color}-600 bg-${color}-50`
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            )}
        >
            <span className={activeTab === id ? `text-${color}-600` : ""}>{icon}</span>
            <span className="hidden sm:inline">{label}</span>
        </button>
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full sticky top-24">
            {/* Header / Tabs */}
            <div className="flex border-b border-gray-100 bg-gray-50/50">
                <button
                    onClick={() => setActiveTab('instagram')}
                    className={clsx("flex-1 py-3 text-sm font-medium transition-all border-b-2", activeTab === 'instagram' ? "border-pink-500 text-pink-600 bg-pink-50/50" : "border-transparent text-gray-500")}
                >
                    <div className="flex items-center justify-center gap-2"><FaInstagram /> <span className="hidden sm:inline">Instagram</span></div>
                </button>
                <button
                    onClick={() => setActiveTab('facebook')}
                    className={clsx("flex-1 py-3 text-sm font-medium transition-all border-b-2", activeTab === 'facebook' ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-transparent text-gray-500")}
                >
                    <div className="flex items-center justify-center gap-2"><FaFacebookF /> <span className="hidden sm:inline">Facebook</span></div>
                </button>
                <button
                    onClick={() => setActiveTab('linkedin')}
                    className={clsx("flex-1 py-3 text-sm font-medium transition-all border-b-2", activeTab === 'linkedin' ? "border-blue-700 text-blue-700 bg-blue-50/50" : "border-transparent text-gray-500")}
                >
                    <div className="flex items-center justify-center gap-2"><FaLinkedinIn /> <span className="hidden sm:inline">LinkedIn</span></div>
                </button>
            </div>

            {/* Preview Area */}
            <div className="p-4 md:p-6 bg-gray-100 flex-1 flex items-center justify-center min-h-[500px]">

                {/* --- INSTAGRAM PREVIEW --- */}
                {activeTab === 'instagram' && (
                    <div className="bg-white w-full max-w-[375px] rounded-xl shadow-sm border border-gray-200 overflow-hidden font-sans text-sm pb-4">
                        {/* Header */}
                        <div className="flex items-center justify-between p-3 border-b border-gray-50">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]">
                                    <div className="w-full h-full rounded-full bg-white border-2 border-white overflow-hidden">
                                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`} alt="profile" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                                <span className="font-semibold text-xs">{userHandle}</span>
                            </div>
                            <FaEllipsis className="text-gray-400 text-xs" />
                        </div>

                        {/* Media */}
                        <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                            {previewUrl ? (
                                isVideo ? (
                                    <video src={previewUrl} className="w-full h-full object-cover" controls />
                                ) : (
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                )
                            ) : (
                                <div className="text-gray-400 text-xs flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl">📸</div>
                                    <span>Upload media to preview</span>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="p-3">
                            <div className="flex items-center justify-between mb-3 text-2xl">
                                <div className="flex gap-4 text-black">
                                    <FaRegHeart className="hover:text-gray-600 cursor-pointer text-xl" />
                                    <FaRegComment className="hover:text-gray-600 cursor-pointer text-xl" />
                                    <FaRegPaperPlane className="hover:text-gray-600 cursor-pointer text-xl" />
                                </div>
                                <FaRegBookmark className="text-black hover:text-gray-600 cursor-pointer text-xl" />
                            </div>

                            <div className="text-xs font-semibold mb-2">1,234 likes</div>

                            <div className="text-xs">
                                <span className="font-semibold mr-2">{userHandle}</span>
                                <span className="whitespace-pre-wrap">{displayCaption}</span>
                            </div>

                            <div className="text-[10px] text-gray-400 uppercase mt-2">{formattedDate}</div>
                        </div>
                    </div>
                )}

                {/* --- FACEBOOK PREVIEW --- */}
                {activeTab === 'facebook' && (
                    <div className="bg-white w-full max-w-[500px] rounded-lg shadow-sm border border-gray-200 overflow-hidden font-sans text-sm pb-2">
                        {/* Header */}
                        <div className="p-3 flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0866FF&color=fff`} alt="profile" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold text-gray-900">{userName}</div>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                    {formattedDate} ·
                                </div>
                            </div>
                            <FaEllipsis className="text-gray-500" />
                        </div>

                        {/* Caption */}
                        <div className="px-3 pb-3 text-sm text-gray-800 whitespace-pre-wrap">
                            {displayCaption}
                        </div>

                        {/* Media */}
                        <div className="bg-gray-100 flex items-center justify-center overflow-hidden min-h-[300px]">
                            {previewUrl ? (
                                isVideo ? (
                                    <video src={previewUrl} className="w-full h-auto max-h-[500px] object-cover" controls />
                                ) : (
                                    <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-[500px] object-cover" />
                                )
                            ) : (
                                <div className="py-20 text-gray-400 text-xs flex flex-col items-center gap-2">
                                    <span>No media</span>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="mx-3 mt-3 border-t border-gray-100 pt-2 flex items-center justify-between text-gray-500 font-medium text-xs sm:text-sm px-4">
                            <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-4 py-2 rounded-lg flex-1 justify-center">
                                <FaThumbsUp /> Like
                            </div>
                            <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-4 py-2 rounded-lg flex-1 justify-center">
                                <FaRegComment /> Comment
                            </div>
                            <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-4 py-2 rounded-lg flex-1 justify-center">
                                <FaShare /> Share
                            </div>
                        </div>
                    </div>
                )}

                {/* --- LINKEDIN PREVIEW --- */}
                {activeTab === 'linkedin' && (
                    <div className="bg-white w-full max-w-[500px] rounded-lg shadow-sm border border-gray-200 overflow-hidden font-sans text-sm pb-2">
                        {/* Header */}
                        <div className="p-3 flex items-center gap-2">
                            <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden">
                                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0077b5&color=fff`} alt="profile" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold text-gray-900 text-sm">{userName}</div>
                                <div className="text-xs text-gray-500">1,234 followers</div>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                    {formattedDate} · <FaGlobeAmericas />
                                </div>
                            </div>
                            <FaEllipsis className="text-gray-500" />
                        </div>

                        {/* Caption */}
                        <div className="px-3 pb-2 text-sm text-gray-800 whitespace-pre-wrap">
                            {displayCaption}
                        </div>

                        {/* Media */}
                        <div className="bg-gray-100 flex items-center justify-center overflow-hidden min-h-[300px]">
                            {previewUrl ? (
                                isVideo ? (
                                    <video src={previewUrl} className="w-full h-auto max-h-[500px] object-cover" controls />
                                ) : (
                                    <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-[500px] object-cover" />
                                )
                            ) : (
                                <div className="py-20 text-gray-400 text-xs flex flex-col items-center gap-2">
                                    <span>No media</span>
                                </div>
                            )}
                        </div>

                        {/* Footer / Actions */}
                        <div className="px-3 py-2 flex items-center justify-between text-xs text-gray-500 border-b border-gray-100">
                            <div className="flex items-center gap-1">
                                <div className="bg-blue-100 rounded-full p-[2px]"><FaThumbsUp className="text-blue-600 text-[8px]" /></div>
                                <span>34</span>
                            </div>
                            <span>2 comments</span>
                        </div>

                        <div className="mx-2 mt-1 flex items-center justify-between text-gray-600 font-semibold text-xs sm:text-sm">
                            <div className="flex flex-col items-center gap-1 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-lg flex-1">
                                <FaThumbsUp className="text-lg" />
                                <span className="text-xs font-medium">Like</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-lg flex-1">
                                <FaRegComment className="text-lg" />
                                <span className="text-xs font-medium">Comment</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-lg flex-1">
                                <FaShare className="text-lg" />
                                <span className="text-xs font-medium">Share</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-lg flex-1">
                                <FaRegPaperPlane className="text-lg" />
                                <span className="text-xs font-medium">Send</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
