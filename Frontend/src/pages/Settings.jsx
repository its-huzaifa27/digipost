
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { SettingsAccount } from '../components/settings/SettingsAccount';
import { SettingsPref } from '../components/settings/SettingsPref';

export function Settings() {
    // -- Theme State --
    const [isMonoMode, setIsMonoMode] = useState(() => localStorage.getItem('theme_mono') === 'true');

    // Toggle Theme
    const toggleMonoMode = () => {
        const newState = !isMonoMode;
        setIsMonoMode(newState);
        localStorage.setItem('theme_mono', String(newState));

        // Apply immediately to document
        if (newState) {
            document.documentElement.classList.add('grayscale');
        } else {
            document.documentElement.classList.remove('grayscale');
        }
    };

    // Apply theme on load
    useEffect(() => {
        if (localStorage.getItem('theme_mono') === 'true') {
            document.documentElement.classList.add('grayscale');
        }
    }, []);

    return (
        <DashboardLayout>
            <div className="p-2 space-y-6 max-w-7xl">
                <div className="flex flex-col gap-2 mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
                    <p className="text-gray-500 text-lg">Manage your workspace preferences and system logs.</p>
                </div>
                <div className="flex flex-col gap-6">
                    <SettingsAccount />
                    <SettingsPref
                        isMonoMode={isMonoMode}
                        toggleMonoMode={toggleMonoMode}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}

