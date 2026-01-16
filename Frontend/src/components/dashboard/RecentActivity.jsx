import React from 'react';
import { FaLinkedinIn, FaTwitter, FaInstagram, FaFacebookF, FaClock, FaCircleCheck, FaSpinner, FaCircle } from 'react-icons/fa6';

export function RecentActivity({ activities }) {
    const getPlatformIcon = (platform) => {
        switch (platform) {
            case 'linkedin': return <FaLinkedinIn className="text-blue-700" />;
            case 'twitter': return <FaTwitter className="text-black" />;
            case 'instagram': return <FaInstagram className="text-pink-600" />;
            case 'facebook': return <FaFacebookF className="text-blue-600" />;
            default: return <FaCircle className="text-gray-400" />;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'published':
                return (
                    <span className="flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">
                        <FaCircleCheck className="mr-1" /> Published
                    </span>
                );
            case 'scheduled':
                return (
                    <span className="flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        <FaClock className="mr-1" /> Scheduled
                    </span>
                );
            case 'draft':
                return (
                    <span className="flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800">
                        <FaSpinner className="mr-1 animate-spin" /> Draft
                    </span>
                );
            default: return null;
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                <button className="text-sm text-blue-600 font-medium hover:text-blue-700">View All</button>
            </div>

            <div className="divide-y divide-gray-50">
                {activities && activities.length > 0 ? (
                    activities.map((activity) => (
                        <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
                                    {getPlatformIcon(activity.platform)}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{activity.content}</p>
                                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                </div>
                            </div>
                            <div>
                                {getStatusBadge(activity.status)}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center text-gray-400">
                        No recent activity found.
                    </div>
                )}
            </div>
        </div>
    );
}
