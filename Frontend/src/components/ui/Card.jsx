import React from 'react';
import { twMerge } from 'tailwind-merge';

export function Card({ children, className, ...props }) {
    return (
        <div
            className={twMerge("bg-white rounded-lg shadow-lg border border-gray-100", className)}
            {...props}
        >
            {children}
        </div>
    );
}
