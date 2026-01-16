import React, { useState } from 'react';

const ChevronDown = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="m6 9 6 6 6-6" />
    </svg>
);

export function Header() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    {/* Logo Section */}
                    <div className="flex-shrink-0 flex items-center cursor-pointer">
                        <img src="https://placehold.co/120x40?text=Logo" alt="Logo" className="h-10" />
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-8 items-center">
                        {['Features', 'Platform', 'Resources'].map((item) => (
                            <div key={item} className="relative group cursor-pointer">
                                <button className="flex items-center text-lg font-medium text-gray-700 hover:text-blue-600 transition-colors">
                                    {item}
                                    <span className="ml-1 mt-1">
                                        <ChevronDown />
                                    </span>
                                </button>
                            </div>
                        ))}
                        <a href="#" className="text-lg font-medium text-gray-700 hover:text-blue-600 transition-colors">
                            Pricing
                        </a>
                    </nav>

                    {/* CTA Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        <button className="text-lg font-semibold text-gray-700 hover:text-blue-600 px-4 py-2 transition-colors">
                            Log in
                        </button>
                        <button className="bg-[#2C4BFF] hover:bg-[#1f38d6] text-white text-lg font-semibold px-6 py-3 rounded-full transition-all hover:shadow-lg transform hover:-translate-y-0.5">
                            Get started for free
                        </button>
                    </div>

                    {/* Mobile Menu Button (Hamburger) */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-700 hover:text-blue-600 focus:outline-none p-2"
                        >
                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div className="md:hidden bg-white shadow-lg border-t border-gray-100 absolute w-full">
                    <div className="px-4 pt-4 pb-6 space-y-3">
                        {['Features', 'Channels', 'Resources', 'Pricing'].map((item) => (
                            <a
                                key={item}
                                href="#"
                                className="block px-3 py-3 text-lg font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors"
                            >
                                {item}
                            </a>
                        ))}
                        <div className="pt-4 space-y-3">
                            <button className="w-full text-center text-lg font-semibold text-gray-700 hover:text-blue-600 py-3 transition-colors">
                                Log in
                            </button>
                            <button className="w-full bg-[#2C4BFF] hover:bg-[#1f38d6] text-white text-lg font-semibold px-6 py-3 rounded-full transition-all shadow-md">
                                Get started for free
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
