import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { FaBuilding, FaLayerGroup, FaGear, FaArrowRightFromBracket, FaChevronDown, FaXmark, FaCircleQuestion, FaCommentDots, FaBookOpen } from 'react-icons/fa6';
import { clsx } from 'clsx';

export function Sidebar({ isOpen, onClose }) {
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

    const handleLogout = async () => {
        try {
            await apiFetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error("Logout failed", error);
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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
        <div className={clsx(
            "fixed top-0 left-0 h-screen bg-white border-r border-gray-100 flex flex-col z-50 transition-transform duration-300 ease-in-out md:translate-x-0 w-64 md:w-48 shadow-2xl md:shadow-none",
            isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
            {/* Logo */}
            <div className="p-4 pb-2 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                        D
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-gray-900 to-gray-600">
                        Publixy
                    </span>
                </Link>
                {/* Mobile Close Button */}
                <button onClick={onClose} className="md:hidden text-gray-500 hover:bg-gray-100 p-2 rounded-lg">
                    <FaXmark className="w-5 h-5" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 mt-4 flex flex-col overflow-y-auto">
                <div className="space-y-1">
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
                            </div>
                        )}
                    </div>

                    <NavItem path="/how-it-works" label="How It Works" icon={<FaBookOpen />} />
                </div>

                {/* Bottom Section: Settings, Help, Feedback */}
                <div className="mt-auto space-y-1 pt-4 pb-4">
                    <div className="w-full h-px bg-gray-100 mb-2"></div>
                    <NavItem path="/settings" label="Settings" icon={<FaGear />} />
                    <NavItem path="/help" label="Help Center" icon={<FaCircleQuestion />} />
                    <NavItem path="/feedback" label="Feedback" icon={<FaCommentDots />} />
                </div>
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
