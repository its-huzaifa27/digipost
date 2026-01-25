import React from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { FaBuilding, FaLayerGroup, FaGear, FaArrowRightFromBracket, FaChevronDown } from 'react-icons/fa6';
import { clsx } from 'clsx';
import { useState, useEffect } from 'react';

export function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const currentView = searchParams.get('view') || 'overview';

    // Auto-open if we are in dashboard
    const [isDashboardOpen, setIsDashboardOpen] = useState(false);

    useEffect(() => {
        if (location.pathname.startsWith('/dashboard')) {
            setIsDashboardOpen(true);
        }
    }, [location.pathname]);

    const handleLogout = () => {
        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect to login
        navigate('/login');
    };

    const NavItem = ({ path, label, icon }) => (
        <Link
            to={path}
            className={clsx(
                "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                location.pathname === path
                    ? "bg-blue-50 text-blue-600 shadow-sm"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            )}
        >
            <span className="text-lg">{icon}</span>
            <span>{label}</span>
        </Link>
    );

    return (
        <div className="w-48 bg-white h-screen fixed left-0 top-0 border-r border-gray-100 flex flex-col z-50">
            {/* Logo */}
            <div className="p-4 pb-2">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                        D
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-gray-900 to-gray-600">
                        Digipost
                    </span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 mt-4 space-y-1 overflow-y-auto">
                <NavItem path="/clients" label="My Clients" icon={<FaBuilding />} />

                {/* Dashboard Dropdown */}
                <div className="space-y-1">
                    <button
                        onClick={() => setIsDashboardOpen(!isDashboardOpen)}
                        className={clsx(
                            "w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                            location.pathname === '/dashboard'
                                ? "bg-blue-50 text-blue-600 shadow-sm"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                        )}
                    >
                        <div className="flex items-center space-x-3">
                            <span className="text-lg"><FaLayerGroup /></span>
                            <span>Dashboard</span>
                        </div>
                        <FaChevronDown className={clsx("w-3 h-3 transition-transform", isDashboardOpen && "rotate-180")} />
                    </button>

                    {isDashboardOpen && (
                        <div className="pl-11 space-y-1 animate-in slide-in-from-top-2 duration-200">
                            <Link
                                to="/dashboard?view=overview"
                                className={clsx(
                                    "block px-3 py-2 rounded-md text-sm transition-colors",
                                    currentView === 'overview' && location.pathname === '/dashboard'
                                        ? "text-blue-600 font-semibold bg-blue-50/50"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                )}
                            >
                                Overview
                            </Link>
                            <Link
                                to="/dashboard?view=ai-agent"
                                className={clsx(
                                    "block px-3 py-2 rounded-md text-sm transition-colors",
                                    currentView === 'ai-agent'
                                        ? "text-blue-600 font-semibold bg-blue-50/50"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                )}
                            >
                                AI Agent
                            </Link>
                            <Link
                                to="/dashboard?view=analytics"
                                className={clsx(
                                    "block px-3 py-2 rounded-md text-sm transition-colors",
                                    currentView === 'analytics'
                                        ? "text-blue-600 font-semibold bg-blue-50/50"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                )}
                            >
                                View Analytics
                            </Link>
                            <Link
                                to="/dashboard?view=create-post"
                                className={clsx(
                                    "block px-3 py-2 rounded-md text-sm transition-colors",
                                    currentView === 'create-post'
                                        ? "text-blue-600 font-semibold bg-blue-50/50"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                )}
                            >
                                Create Post
                            </Link>
                            <Link
                                to="/dashboard?view=overview"
                                className={clsx(
                                    "block px-3 py-2 rounded-md text-sm transition-colors",
                                    "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                )}
                            >
                                Connect Platform
                            </Link>
                        </div>
                    )}
                </div>

                <NavItem path="/settings" label="Settings" icon={<FaGear />} />
            </nav>

            {/* User Profile / Logout */}
            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                    <FaArrowRightFromBracket />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}
