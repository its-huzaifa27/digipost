import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { FaLink, FaPenNib, FaPaperPlane } from 'react-icons/fa6';

export function HowItWorks() {
    const steps = [
        {
            id: 1,
            title: "Connect",
            description: "Inter-connect all your content in one place. Connect & manage as many social accounts and channels as you want and save hours of your precious time!",
            icon: <FaLink className="w-8 h-8 text-white" />,
            color: "bg-green-500"
        },
        {
            id: 2,
            title: "Compose",
            description: "Create / Compose Post for your Connected Social Media accounts and Publish or schedule them directly from Viral Dashboard.",
            icon: <FaPenNib className="w-8 h-8 text-white" />,
            color: "bg-yellow-500"
        },
        {
            id: 3,
            title: "Publish",
            description: "Publish your content to all your connected social media channels in one click. You can also schedule your posts for the future.",
            icon: <FaPaperPlane className="w-8 h-8 text-white" />,
            color: "bg-blue-500"
        }
    ];

    return (
        <DashboardLayout>
            <div className="p-8 max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Works in 3 Easy Steps</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">Master the art of social media management with our simple workflow.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {steps.map((step) => (
                        <div key={step.id} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow duration-300 relative overflow-hidden group">
                            <div className={`absolute top-0 right-0 w-32 h-32 ${step.color} opacity-5 rounded-bl-[100px] transition-transform group-hover:scale-150 duration-500`}></div>

                            <div className={`${step.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg rotate-3 group-hover:rotate-6 transition-transform`}>
                                {step.icon}
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                                <span className={`flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm ${step.color.replace('bg-', 'text-')} font-extrabold`}>
                                    {step.id}
                                </span>
                                {step.title}
                            </h2>

                            <p className="text-gray-600 leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Visual Connector Line (Desktop) */}
                <div className="hidden md:block absolute top-[300px] left-0 w-full -z-10 opacity-20 pointer-events-none">
                    <svg width="100%" height="200" viewBox="0 0 1000 200" preserveAspectRatio="none">
                        <path d="M100,50 C300,50 300,150 500,150 C700,150 700,50 900,50" fill="none" stroke="gray" strokeWidth="2" strokeDasharray="5,5" />
                    </svg>
                </div>

                <div className="mt-16 bg-blue-50 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to get started?</h3>
                        <p className="text-gray-600">Connect your first account now and see the magic happen.</p>
                    </div>
                    <a href="/dashboard?view=overview" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-blue-200">
                        Go to Dashboard
                    </a>
                </div>
            </div>
        </DashboardLayout>
    );
}
