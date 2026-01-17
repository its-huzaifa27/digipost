import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBuilding, FaLayerGroup, FaPenNib, FaRobot, FaChartPie, FaGear, FaArrowRightFromBracket } from 'react-icons/fa6';
import { clsx } from 'clsx';

export function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();

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
                <NavItem path="/dashboard" label="Dashboard" icon={<FaLayerGroup />} />
                <NavItem path="/create-post" label="Create Post" icon={<FaPenNib />} />
                <NavItem path="/ai-agent" label="AI Agent" icon={<FaRobot />} />
                <NavItem path="/analytics" label="Analytics" icon={<FaChartPie />} />
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
