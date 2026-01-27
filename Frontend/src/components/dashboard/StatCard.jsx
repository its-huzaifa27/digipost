import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function StatCard({ title, value, subtext, icon, trend, color }) {
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
                <div className={twMerge("p-3 rounded-lg", color)}>
                    {icon}
                </div>
                {trend && (
                    <span className={clsx("text-xs font-semibold px-2 py-1 rounded-full",
                        trend > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                    )}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            <div>
                <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
                <h4 className="text-2xl font-bold text-gray-900 mt-1">{value}</h4>
                {subtext && <p className="text-gray-400 text-xs mt-2">{subtext}</p>}
            </div>
        </div>
    );
}
