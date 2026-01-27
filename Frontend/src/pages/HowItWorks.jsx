import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { FaUserTie, FaStore, FaLink, FaUserCheck, FaRightToBracket, FaListCheck, FaMeta } from 'react-icons/fa6';

export function HowItWorks() {
    const steps = [
        {
            id: 1,
            title: "Convert to Professional",
            description: "Meta requires Business accounts for API access. Convert your Instagram to a Professional/Business account and your Facebook to Professional mode (or create a Page).",
            icon: <FaUserTie className="w-6 h-6 text-white" />,
            color: "bg-purple-600",
            badge: "Required"
        },
        {
            id: 2,
            title: "Ensure Facebook Page Exists",
            description: "Instagram posting via API *always* requires a Facebook Page. Create a new one for your business or use an existing one.",
            icon: <FaStore className="w-6 h-6 text-white" />,
            color: "bg-blue-600",
            badge: "Required"
        },
        {
            id: 3,
            title: "Link Instagram to Page",
            description: "Go to Facebook Page Settings → Linked Accounts → Instagram → Connect. This explicitly links your two assets so we can manage both.",
            icon: <FaLink className="w-6 h-6 text-white" />,
            color: "bg-pink-600",
            badge: "Crucial"
        },
        {
            id: 4,
            title: "Developer Access (Beta Only)",
            description: "Since our app is in Development Mode, we must manually add you as a 'Tester'. Please accept the invite sent to your Facebook account.",
            icon: <FaUserCheck className="w-6 h-6 text-white" />,
            color: "bg-yellow-600",
            badge: "Beta Only"
        },
        {
            id: 5,
            title: "Connect to Digipost",
            description: "Log in with Facebook on our dashboard. Grant all requested permissions to allow us to read analytics and publish posts.",
            icon: <FaRightToBracket className="w-6 h-6 text-white" />,
            color: "bg-green-600",
            badge: "Action"
        },
        {
            id: 6,
            title: "Manage Content",
            description: "You're all set! You can now create, schedule, and publish posts to both Facebook and Instagram directly from Digipost.",
            icon: <FaListCheck className="w-6 h-6 text-white" />,
            color: "bg-indigo-600",
            badge: "Success"
        }
    ];

    return (
        <DashboardLayout>
            <div className="p-8 max-w-5xl mx-auto">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-10 mb-12 text-white relative overflow-hidden shadow-2xl">
                    <div className="relative z-10 max-w-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-500/30">
                                Client Onboarding
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
                            How to Connect Your Accounts
                        </h1>
                        <p className="text-lg text-gray-300 leading-relaxed mb-8">
                            To manage your Facebook & Instagram accounts via our API, Meta has strict security requirements.
                            Follow this guide to convert, link, and connect your assets correctly.
                        </p>
                        <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-4 rounded-xl inline-flex items-center gap-4">
                            <FaMeta className="text-3xl" />
                            <div className="text-sm">
                                <p className="font-bold">Official Meta Requirement</p>
                                <p className="text-gray-400">Personal accounts cannot be automated.</p>
                            </div>
                        </div>
                    </div>
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
                </div>

                {/* Steps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                    {steps.map((step, index) => (
                        <div key={step.id} className="group relative bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    {step.icon}
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${step.badge === 'Required' ? 'bg-red-100 text-red-700' :
                                        step.badge === 'Crucial' ? 'bg-purple-100 text-purple-700' :
                                            step.badge === 'Beta Only' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-green-100 text-green-700'
                                    }`}>
                                    {step.badge}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <span className="text-gray-300 font-black text-2xl select-none">{step.id}.</span>
                                {step.title}
                            </h3>

                            <p className="text-gray-600 text-sm leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Reality Check Box */}
                <div className="mt-12 bg-red-50 border border-red-100 rounded-2xl p-8 flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">⚠️ Important Reality Check</h3>
                        <p className="text-gray-700 mb-4">
                            We cannot bypass these rules. Meta's API will strictly <span className="font-bold underline">block</span>:
                        </p>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2 text-red-700 font-medium">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                Posting to Personal Instagram accounts
                            </li>
                            <li className="flex items-center gap-2 text-red-700 font-medium">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                Posting to Unlinked accounts
                            </li>
                            <li className="flex items-center gap-2 text-red-700 font-medium">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                Managing without Business conversion
                            </li>
                        </ul>
                    </div>
                    <div className="shrink-0 bg-white p-6 rounded-xl border border-red-100 shadow-sm max-w-sm">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">What to tell clients</p>
                        <p className="text-gray-800 italic font-medium">
                            "Sir, to manage your Facebook & Instagram from our system, your accounts must be converted to business type and connected. This is required by Meta for security and automation."
                        </p>
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-8 flex justify-center">
                    <a href="/dashboard?view=overview" className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-black transition-colors shadow-lg hover:shadow-xl">
                        Go to Dashboard & Connect
                        <FaRightToBracket />
                    </a>
                </div>
            </div>
        </DashboardLayout>
    );
}
