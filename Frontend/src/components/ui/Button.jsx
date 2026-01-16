import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    className,
    ...props
}) {
    const baseStyles = "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer";

    const variants = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
        secondary: "bg-white/10 backdrop-blur-md border border-black/20 text-black hover:bg-white/20",
        ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
        gradient: "bg-linear-to-r from-blue-600 to-purple-600 text-white hover:shadow-cyan-500/50 shadow-lg hover:scale-105 hover:from-blue-500 hover:to-purple-500 ring-2 ring-purple-400/50"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
        xl: "px-8 py-4 text-lg"
    };

    return (
        <button
            className={twMerge(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        >
            {children}
        </button>
    );
}
