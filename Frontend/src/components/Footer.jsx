import React from 'react';
import { Link } from 'react-router-dom';
import { FaTwitter, FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

export function Footer() {
    return (
        <footer className="relative bg-gradient-to-r from-blue-700 to-violet-900 to-black pt-20 pb-10 font-sans overflow-hidden">
            {/* Ambient Background Glow matching logo colors */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl translate-y-1/2 pointer-events-none"></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
                    {/* Brand Column */}
                    <div className="md:col-span-1 space-y-6">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-500 blur-md opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                                <img
                                    src="/images/logo/logo.png"
                                    alt="Publixy Logo"
                                    className="w-10 h-10 object-contain relative"
                                />
                            </div>
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                Publixy
                            </span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                            Empowering your digital presence with AI-driven social media management tools. Join the revolution today.
                        </p>
                        <div className="flex space-x-4 pt-2">
                            {[
                                { icon: FaTwitter, href: "#", color: "hover:bg-[#1DA1F2]" },
                                { icon: FaFacebookF, href: "#", color: "hover:bg-[#4267B2]" },
                                { icon: FaInstagram, href: "#", color: "hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-red-500 hover:to-purple-500" },
                                { icon: FaLinkedinIn, href: "#", color: "hover:bg-[#0077b5]" }
                            ].map((social, index) => (
                                <a
                                    key={index}
                                    href={social.href}
                                    className={`w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 ${social.color} hover:text-white hover:border-transparent transition-all duration-300 transform hover:scale-110`}
                                >
                                    <social.icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div>
                        <h3 className="font-bold text-white text-lg mb-6">Product</h3>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>Features</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>Pricing</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>API</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>Integrations</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-white text-lg mb-6">Company</h3>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-purple-400 transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>About Us</a></li>
                            <li><a href="#" className="hover:text-purple-400 transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>Careers</a></li>
                            <li><a href="#" className="hover:text-purple-400 transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>Blog</a></li>
                            <li><a href="#" className="hover:text-purple-400 transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>Contact</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-white text-lg mb-6">Legal</h3>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-pink-400 transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-pink-400 transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>Terms of Service</a></li>
                            <li><a href="#" className="hover:text-pink-400 transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>Cookie Policy</a></li>
                            <li><a href="#" className="hover:text-pink-400 transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>Security</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} Publixy. All rights reserved.
                    </p>
                    <div className="flex items-center gap-8 text-sm text-gray-500">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Sitemap</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
