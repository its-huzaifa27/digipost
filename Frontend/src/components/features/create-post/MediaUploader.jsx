import React, { useState } from 'react';
import { clsx } from 'clsx';
import { FaTrash, FaPlus } from 'react-icons/fa6';

export function MediaUploader({ media, onFileChange, onDrop }) {
    const [isDragging, setIsDragging] = useState(false);

    // Media is now expected to be an Array (or null/empty)
    const files = Array.isArray(media) ? media : (media ? [media] : []);

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
        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length > 0) {
            // Append or Replace? Let's Append for carousel support
            onDrop([...files, ...droppedFiles]);
        }
    };

    const handleFileChangeInternal = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length > 0) {
            onFileChange([...files, ...selectedFiles]);
        }
    };

    const removeFile = (index) => {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        onFileChange(newFiles);
    };

    return (
        <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
                Upload Media (Images/Videos):
            </label>

            {/* Grid for existing files */}
            {files.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 animate-in fade-in slide-in-from-top-2">
                    {files.map((file, idx) => (
                        <div key={idx} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                            {file.type.startsWith('image/') ? (
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt={`Preview ${idx}`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <video
                                    src={URL.createObjectURL(file)}
                                    controls={false}
                                    className="w-full h-full object-cover"
                                />
                            )}
                            {/* Remove Button */}
                            <button
                                type="button"
                                onClick={() => removeFile(idx)}
                                className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-600 rounded-full shadow-sm hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                            >
                                <FaTrash size={12} />
                            </button>
                            {/* Index Badge */}
                            <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 text-white text-xs rounded-full backdrop-blur-sm">
                                {idx + 1}
                            </div>
                        </div>
                    ))}

                    {/* Add More Button (Mini Uploader) */}
                    <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all text-gray-400 hover:text-blue-500">
                        <FaPlus size={24} />
                        <span className="text-xs font-medium mt-2">Add More</span>
                        <input
                            type="file"
                            onChange={handleFileChangeInternal}
                            accept="image/*,video/*"
                            multiple
                            className="hidden"
                        />
                    </label>
                </div>
            )}

            {/* Main Uploader (only show big one if empty) */}
            {files.length === 0 && (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDropInternal}
                    className={clsx(
                        "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                        isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                    )}
                >
                    <label className="cursor-pointer">
                        <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <div className="pointer-events-auto">
                                <span className="text-blue-600 font-semibold hover:text-blue-700">Click to upload</span>
                                <span className="text-gray-600"> or drag and drop</span>
                            </div>
                            <p className="text-sm text-gray-500">Photos or Videos (Select multiple for Carousel)</p>

                            <input
                                type="file"
                                onChange={handleFileChangeInternal}
                                accept="image/*,video/*"
                                multiple
                                className="hidden"
                            />
                        </div>
                    </label>
                </div>
            )}
        </div>
    );
}
