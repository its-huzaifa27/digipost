import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Input({
    label,
    className,
    error,
    rightElement,
    ...props
}) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    className={twMerge(
                        "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all",
                        rightElement && "pr-12",
                        error
                            ? "border-red-300 focus:ring-red-500 text-red-900 placeholder-red-300"
                            : "border-gray-300 focus:ring-blue-500 text-gray-700 placeholder-gray-400",
                        className
                    )}
                    {...props}
                />
                {rightElement && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                        {rightElement}
                    </div>
                )}
            </div>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}
