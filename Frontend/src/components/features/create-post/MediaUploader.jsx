import React, { useState } from 'react';
import { clsx } from 'clsx';

export function MediaUploader({ media, onFileChange, onDrop }) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDropInternal = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            onDrop(files[0]);
        }
    };

    const handleFileChangeInternal = (e) => {
        if (e.target.files.length > 0) {
            onFileChange(e.target.files[0]);
        }
    };

    return (
        <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
                Upload Media:
            </label>
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDropInternal}
                className={clsx(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                    isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"
                )}
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
                                onChange={handleFileChangeInternal}
                                accept="image/*,video/*"
                                className="hidden"
                            />
                        </label>
                    </div>

                    <p className="text-sm text-gray-500">Image or Video file</p>

                    {media && (
                        <div className="mt-4 w-full">
                            {media.type.startsWith('image/') ? (
                                <img
                                    src={URL.createObjectURL(media)}
                                    alt="Preview"
                                    className="max-h-64 mx-auto rounded-lg shadow-sm object-contain"
                                />
                            ) : (
                                <video
                                    src={URL.createObjectURL(media)}
                                    controls
                                    className="max-h-64 mx-auto rounded-lg shadow-sm"
                                />
                            )}
                            <p className="text-sm text-green-600 font-medium mt-2">
                                ✓ {media.name}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
