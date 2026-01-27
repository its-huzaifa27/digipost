import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export function AuthLayout({ children }) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 25, stiffness: 150 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    const moveX = useTransform(springX, [-0.5, 0.5], [-20, 20]);
    const moveY = useTransform(springY, [-0.5, 0.5], [-20, 20]);

    // Reverse movement for depth effect
    const moveXReverse = useTransform(springX, [-0.5, 0.5], [20, -20]);
    const moveYReverse = useTransform(springY, [-0.5, 0.5], [20, -20]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            const { innerWidth, innerHeight } = window;
            const x = (e.clientX / innerWidth) - 0.5;
            const y = (e.clientY / innerHeight) - 0.5;
            mouseX.set(x);
            mouseY.set(y);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <div className="min-h-screen w-full bg-white relative overflow-hidden flex items-center justify-center p-4">

            {/* Animated Background Shapes */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {/* Top Left Blob */}
                <motion.div
                    style={{ x: moveX, y: moveY }}
                    className="absolute -top-20 -left-20 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"
                />

                {/* Top Right Blob */}
                <motion.div
                    style={{ x: moveXReverse, y: moveYReverse }}
                    className="absolute top-0 -right-4 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"
                />

                {/* Bottom Blob */}
                <motion.div
                    style={{ x: moveX, y: moveYReverse }}
                    className="absolute -bottom-32 left-20 w-80 h-80 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"
                />
            </div>

            {/* Content Container (Card) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Glassmorphism Effect */}
                <div className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 sm:p-10">
                    {children}
                </div>
            </motion.div>
        </div>
    );
}
