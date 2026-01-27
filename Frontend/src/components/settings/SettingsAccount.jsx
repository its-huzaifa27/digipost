import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaLock, FaBell } from 'react-icons/fa6';
import { DropdownItem } from '../../components/ui/DropdownItem';

export const SettingsAccount = () => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Account</h2>
                <p className="text-gray-500 mt-1">Manage your account settings and preferences</p>
            </div>

            <div>
                <DropdownItem
                    title="Profile Information"
                    description="Update your personal details"
                    icon={FaUser}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <input
                                type="text"
                                placeholder="Enter your full name"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                            <textarea
                                placeholder="Tell us about yourself"
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                            Save Changes
                        </button>
                    </div>
                </DropdownItem>

                <DropdownItem
                    title="Email Settings"
                    description="Manage your email address"
                    icon={FaEnvelope}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Current Email</label>
                            <input
                                type="email"
                                placeholder="your@email.com"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">New Email</label>
                            <input
                                type="email"
                                placeholder="new@email.com"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                            Update Email
                        </button>
                    </div>
                </DropdownItem>

                <DropdownItem
                    title="Password"
                    description="Change your password"
                    icon={FaLock}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                            Change Password
                        </button>
                    </div>
                </DropdownItem>

                <DropdownItem
                    title="Notifications"
                    description="Configure notification preferences"
                    icon={FaBell}>
                    <div className="space-y-3">
                        <label className="flex items-center justify-between p-3 hover:bg-white rounded-lg cursor-pointer">
                            <span className="text-gray-700">Email Notifications</span>
                            <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500" />
                        </label>
                        <label className="flex items-center justify-between p-3 hover:bg-white rounded-lg cursor-pointer">
                            <span className="text-gray-700">Push Notifications</span>
                            <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500" />
                        </label>
                        <label className="flex items-center justify-between p-3 hover:bg-white rounded-lg cursor-pointer">
                            <span className="text-gray-700">Weekly Summary</span>
                            <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500" />
                        </label>
                        <label className="flex items-center justify-between p-3 hover:bg-white rounded-lg cursor-pointer">
                            <span className="text-gray-700">Post Reminders</span>
                            <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500" />
                        </label>
                    </div>
                </DropdownItem>
            </div>
        </div>
    );
};
