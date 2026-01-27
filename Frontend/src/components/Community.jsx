import React from 'react';
import { motion } from 'framer-motion';
import { FaInstagram, FaLinkedinIn, FaFacebookF, FaMastodon, FaLayerGroup } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";
// import { BsButterfly } from "react-icons/bs";
import { HiArrowRight } from "react-icons/hi";

export function Community() {
    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-20">
            <div className="bg-[#931efa] rounded-[40px] px-6 py-12 md:py-8 md:px-12 flex flex-col md:flex-row items-center justify-between relative overflow-hidden">

                {/* Left Section: Badge & Title */}
                <div className="flex items-center space-x-4 z-10 mb-8 md:mb-0">
                    <div className="px-3 py-1 border-2 border-gray-800 rounded-lg transform -rotate-2">
                        <span className="text-sm font-bold text-gray-800 tracking-wider">NEW</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Community</h2>
                </div>

                {/* Center Section: Orbital Icons */}
                <div className="relative w-64 h-32 md:w-96 md:h-40 flex items-center justify-center mb-8 md:mb-0">
                    {/* Central Logo */}
                    <div className="absolute z-20 bg-[#1A2C38] p-3 rounded-full shadow-lg">
                        <FaLayerGroup className="text-[#87C298] text-2xl" />
                    </div>

                    {/* Orbiting Icons */}
                    {[
                        { Icon: FaInstagram, color: "bg-pink-500", x: -90, y: -50, delay: 0.1 },
                        { Icon: FaXTwitter, color: "bg-black", x: 100, y: -40, delay: 0.2 },
                        { Icon: FaFacebookF, color: "bg-blue-600", x: -50, y: 60, delay: 0.3 },
                        { Icon: FaLinkedinIn, color: "bg-[#0077b5]", x: 120, y: 10, delay: 0.4 },
                        // { Icon: BsButterfly, color: "bg-[#4A90E2]", x: 80, y: 60, delay: 0.5 },
                        { Icon: FaMastodon, color: "bg-[#6364FF]", x: -110, y: 50, delay: 0.6 },
                    ].map(({ Icon, color, x, y, delay }, index) => (
                        <motion.div
                            key={index}
                            className={`absolute z-10 text-white ${color} p-2 rounded-full shadow-sm`}
                            initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                            whileInView={{ x, y, scale: 1, opacity: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 100,
                                damping: 15,
                                delay
                            }}
                            viewport={{ once: true }}
                        >
                            <Icon size={14} />
                        </motion.div>
                    ))}

                    {/* Decorative dots */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1, x: -70, y: -30 }}
                        transition={{ delay: 0.7 }}
                        className="absolute w-2 h-2 bg-[#FF6B6B] rounded-full"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1, x: 90, y: 50 }}
                        transition={{ delay: 0.8 }}
                        className="absolute w-2 h-2 bg-[#FF6B6B] rounded-full"
                    />
                </div>

                {/* Right Section: Description & Arrow */}
                <div className="flex items-center space-x-4 z-10 text-center md:text-left">
                    <p className="text-gray-800 font-medium max-w-[200px] leading-tight">
                        A focused space to reply to every comment
                    </p>
                    <HiArrowRight className="text-gray-800 text-2xl" />
                </div>
            </div>
        </div>
    )
}