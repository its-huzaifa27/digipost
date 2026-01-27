import React from 'react';
import { FaPalette, FaLanguage, FaDesktop, FaLock, FaMoon } from 'react-icons/fa6';
import { DropdownItem } from '../../components/ui/DropdownItem';

export const SettingsPref = ({ isMonoMode, toggleMonoMode }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Preferences</h2>
                <p className="text-gray-500 mt-1">Customize your workspace experience</p>
            </div>

            <div>
                <DropdownItem
                    title="Appearance"
                    description="Customize the look and feel"
                    icon={FaPalette}>
                    <div className="space-y-4">
                        <label className="flex items-center justify-between p-3 hover:bg-white rounded-lg cursor-pointer">
                            <div className="flex items-center gap-3">
                                <FaMoon className="text-gray-600" />
                                <div>
                                    <p className="font-medium text-gray-900">Monochrome Mode</p>
                                    <p className="text-sm text-gray-500">Switch to grayscale theme</p>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                checked={isMonoMode}
                                onChange={toggleMonoMode}
                                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                            />
                        </label>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                                <option>Light</option>
                                <option>Dark</option>
                                <option>Auto</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                            <div className="flex gap-3">
                                {['bg-indigo-600', 'bg-blue-600', 'bg-purple-600', 'bg-pink-600', 'bg-green-600'].map((color) => (
                                    <button
                                        key={color}
                                        className={`w-10 h-10 rounded-full ${color} hover:scale-110 transition-transform border-2 border-white shadow-md`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </DropdownItem>

                <DropdownItem
                    title="Language & Region"
                    description="Set your language and timezone"
                    icon={FaLanguage}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                                <option>English (US)</option>
                                <option>English (UK)</option>
                                <option>Spanish</option>
                                <option>French</option>
                                <option>German</option>
                                <option>Hindi</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                                <option>(GMT+05:30) India Standard Time</option>
                                <option>(GMT+00:00) UTC</option>
                                <option>(GMT-05:00) Eastern Time</option>
                                <option>(GMT-08:00) Pacific Time</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                                <option>MM/DD/YYYY</option>
                                <option>DD/MM/YYYY</option>
                                <option>YYYY-MM-DD</option>
                            </select>
                        </div>
                    </div>
                </DropdownItem>

                <DropdownItem
                    title="Display"
                    description="Adjust display settings"
                    icon={FaDesktop}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Dashboard Layout</label>
                            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                                <option>Compact</option>
                                <option>Comfortable</option>
                                <option>Spacious</option>
                            </select>
                        </div>
                        <label className="flex items-center justify-between p-3 hover:bg-white rounded-lg cursor-pointer">
                            <span className="text-gray-700">Show Sidebar</span>
                            <input type="checkbox" defaultChecked className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500" />
                        </label>
                        <label className="flex items-center justify-between p-3 hover:bg-white rounded-lg cursor-pointer">
                            <span className="text-gray-700">Compact Navigation</span>
                            <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500" />
                        </label>
                        <label className="flex items-center justify-between p-3 hover:bg-white rounded-lg cursor-pointer">
                            <span className="text-gray-700">Show Tooltips</span>
                            <input type="checkbox" defaultChecked className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500" />
                        </label>
                    </div>
                </DropdownItem>

                <DropdownItem
                    title="Privacy"
                    description="Control your privacy settings"
                    icon={FaLock}>
                    <div className="space-y-3">
                        <label className="flex items-center justify-between p-3 hover:bg-white rounded-lg cursor-pointer">
                            <span className="text-gray-700">Share Analytics Data</span>
                            <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500" />
                        </label>
                        <label className="flex items-center justify-between p-3 hover:bg-white rounded-lg cursor-pointer">
                            <span className="text-gray-700">Allow Cookies</span>
                            <input type="checkbox" defaultChecked className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500" />
                        </label>
                        <label className="flex items-center justify-between p-3 hover:bg-white rounded-lg cursor-pointer">
                            <span className="text-gray-700">Two-Factor Authentication</span>
                            <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500" />
                        </label>
                        <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors mt-4">
                            Delete Account
                        </button>
                    </div>
                </DropdownItem>
            </div>
        </div>
    );
};
