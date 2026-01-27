import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Button } from '../components/ui/Button';

export function Feedback() {
    const [feedback, setFeedback] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real app, send to backend
        console.log("Feedback submitted:", feedback);
        setSubmitted(true);
    };

    return (
        <DashboardLayout>
            <div className="p-8 max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Give Feedback</h1>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    {submitted ? (
                        <div className="text-center py-8">
                            <div className="text-green-500 text-5xl mb-4">✓</div>
                            <h3 className="text-2xl font-bold text-gray-900">Thank You!</h3>
                            <p className="text-gray-600 mt-2">Your feedback helps us improve Digipost.</p>
                            <button
                                onClick={() => { setSubmitted(false); setFeedback(""); }}
                                className="mt-6 text-blue-600 font-medium hover:underline"
                            >
                                Send more feedback
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    How can we improve your experience?
                                </label>
                                <textarea
                                    className="w-full h-40 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    placeholder="Tell us what you like, what you don't, or what features you'd like to see..."
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={!feedback.trim()}>
                                    Submit Feedback
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
