"use client";

import { useState } from "react";

export default function ConsultationsPage() {
    const [activeTab, setActiveTab] = useState<'request' | 'history'>('request');

    return (
        <div>
            <h1 className="font-serif text-3xl text-primary mb-8">Consultations</h1>

            <div className="flex gap-4 mb-8 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('request')}
                    className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'request'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    Request New
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'history'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    History
                </button>
            </div>

            {activeTab === 'request' && (
                <div className="bg-white p-8 rounded-lg shadow-sm border border-primary/10 max-w-2xl">
                    <h2 className="font-serif text-2xl text-gray-800 mb-6">Request a Consultation</h2>
                    <p className="text-text/70 mb-8">
                        Need guidance on your practice or have specific health concerns?
                        Request a 15-minute consultation with one of our senior teachers.
                    </p>

                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                        <div>
                            <label className="block text-xs font-bold text-text/60 uppercase tracking-wider mb-2">Topic</label>
                            <select className="w-full p-3 border border-gray-200 rounded focus:outline-none focus:border-primary">
                                <option>General Guidance</option>
                                <option>Health Issue / Injury</option>
                                <option>Progress Review</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-text/60 uppercase tracking-wider mb-2">Preferred Time of Day</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 border border-gray-200 p-3 rounded flex-1 cursor-pointer hover:bg-gray-50">
                                    <input type="radio" name="time" value="morning" />
                                    <span className="text-sm">Morning</span>
                                </label>
                                <label className="flex items-center gap-2 border border-gray-200 p-3 rounded flex-1 cursor-pointer hover:bg-gray-50">
                                    <input type="radio" name="time" value="evening" />
                                    <span className="text-sm">Evening</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-text/60 uppercase tracking-wider mb-2">Notes / Questions</label>
                            <textarea
                                className="w-full p-3 border border-gray-200 rounded focus:outline-none focus:border-primary h-32"
                                placeholder="Briefly describe what you'd like to discuss..."
                            ></textarea>
                        </div>

                        <button className="px-8 py-3 bg-primary text-white font-bold uppercase tracking-widest rounded hover:bg-secondary transition-colors shadow-lg">
                            Submit Request
                        </button>
                    </form>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="space-y-4">
                    {/* Mock History Item 1 */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">Progress Review</h3>
                                <p className="text-sm text-text/60">with Dr. Rao • Oct 15, 2025</p>
                            </div>
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold uppercase tracking-widest rounded">Completed</span>
                        </div>
                        <div className="bg-gray-50 p-4 rounded text-sm text-text/80">
                            <strong>Teacher's Note:</strong> Recommended adding Surya Namaskar B to daily routine. Focus on breath retention.
                        </div>
                    </div>

                    {/* Mock History Item 2 */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 opacity-70">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">Initial Consultation</h3>
                                <p className="text-sm text-text/60">with Sarah J. • Sep 01, 2025</p>
                            </div>
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold uppercase tracking-widest rounded">Completed</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
