import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaXmark, FaChartPie, FaDownload, FaFilter } from 'react-icons/fa6';
import { Button } from '../ui/Button';

export function AnalysisDrawer({ isOpen, onClose, clientName }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" // Backdrop only on mobile/tablet if desired, or remove lg:hidden for full focus
                    />

                    {/* Drawer Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full sm:w-[500px] lg:w-[600px] bg-white shadow-2xl z-50 border-l border-gray-100 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <FaChartPie className="text-blue-600" />
                                    Deep Analysis
                                </h2>
                                <p className="text-sm text-gray-500">Detailed performance metrics for {clientName}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <FaXmark className="text-lg" />
                            </button>
                        </div>

                        {/* Content Scroll Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">

                            {/* Filters Mockup */}
                            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                                <Button variant="outline" className="text-xs py-1.5 h-auto whitespace-nowrap gap-2">
                                    <FaFilter /> Last 30 Days
                                </Button>
                                <Button variant="outline" className="text-xs py-1.5 h-auto whitespace-nowrap">Platform: All</Button>
                                <Button variant="outline" className="text-xs py-1.5 h-auto whitespace-nowrap">Content: Posts</Button>
                            </div>

                            {/* Section 1: Audience Growth */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-800 border-l-4 border-purple-500 pl-3">Audience Growth</h3>
                                <div className="h-48 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-gray-400">
                                    [Detailed Growth Chart Placeholder]
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-purple-50 p-3 rounded-lg text-center">
                                        <div className="text-xs text-purple-600 font-medium">New Followers</div>
                                        <div className="text-lg font-bold text-gray-900">+1,240</div>
                                    </div>
                                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                                        <div className="text-xs text-blue-600 font-medium">Profile Views</div>
                                        <div className="text-lg font-bold text-gray-900">8.5k</div>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-lg text-center">
                                        <div className="text-xs text-green-600 font-medium">Conv. Rate</div>
                                        <div className="text-lg font-bold text-gray-900">2.4%</div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Engagement Breakdown */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-800 border-l-4 border-blue-500 pl-3">Engagement Breakdown</h3>
                                <div className="h-48 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-gray-400">
                                    [Interactive Heatmap Placeholder]
                                </div>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Your audience is most active on <span className="font-semibold text-gray-700">Wednesdays at 6 PM</span>.
                                    Video content is performing <span className="text-green-600 font-bold">2.5x better</span> than static images this week.
                                </p>
                            </div>

                            {/* Section 3: Top Performing Content */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-800 border-l-4 border-orange-500 pl-3">Top Content</h3>
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex gap-4 p-3 bg-white border border-gray-100 rounded-xl shadow-xs hover:shadow-md transition-shadow">
                                            <div className="w-16 h-16 bg-gray-200 rounded-lg shrink-0" />
                                            <div>
                                                <div className="font-semibold text-gray-900 text-sm">Summer Campaign #2</div>
                                                <div className="text-xs text-gray-400 mt-1">Posted 2 days ago • Instagram</div>
                                                <div className="flex gap-3 mt-2 text-xs font-medium">
                                                    <span className="text-pink-600">❤ 1.2k</span>
                                                    <span className="text-blue-600">💬 45</span>
                                                    <span className="text-gray-600">↗ 120</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
                            <Button variant="outline" className="flex-1 gap-2">
                                <FaDownload /> Export Report
                            </Button>
                            <Button variant="gradient" className="flex-1">
                                Schedule Report
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
