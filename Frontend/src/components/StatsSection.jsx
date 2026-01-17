import React, { useEffect, useState, useRef } from "react";
import { motion, useSpring, useTransform, useInView } from "framer-motion";

const Counter = ({ value, label, suffix = "" }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    // Use spring for smoother animation physics
    const springValue = useSpring(0, {
        stiffness: 50,
        damping: 20,
        duration: 2.5
    });

    // Transform the numerical value to a formatted string with commas
    const displayValue = useTransform(springValue, (latest) => {
        if (Math.round(latest) === 0) return "0";
        return Math.floor(latest).toLocaleString(); // Add commas
    });

    useEffect(() => {
        if (isInView) {
            springValue.set(value);
        }
    }, [isInView, value, springValue]);

    return (
        <div ref={ref} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center text-center h-48 hover:shadow-md transition-shadow duration-300">
            <div className="text-5xl font-bold text-gray-900 mb-4 font-mono flex items-center justify-center">
                <motion.span>{displayValue}</motion.span>
                <span>{suffix}</span>
            </div>
            <span className="text-sm font-bold text-gray-500 tracking-wider uppercase">{label}</span>
            <div className="mt-4 flex gap-1 justify-center">
                <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                <div className="w-1 h-1 rounded-full bg-gray-300"></div>
            </div>
        </div>
    );
};

export const StatsSection = () => {
    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Counter value={191726} label="Active Users" />
                <Counter value={7858881} label="Posts Published Last Month" />
                <Counter value={11} label="Social Platforms Supported" />
            </div>
        </div>
    );
};
