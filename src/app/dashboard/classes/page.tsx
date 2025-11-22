"use client";

import { useState } from "react";
import { generateGroupSlots } from "@/utils/slots";

export default function ClassesPage() {
    const [activeTab, setActiveTab] = useState<'upcoming' | 'book'>('upcoming');
    const slots = generateGroupSlots();
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

    return (
        <div>
            <h1 className="font-serif text-3xl text-primary mb-8">My Classes</h1>

            <div className="flex gap-4 mb-8 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'upcoming'
                            ? 'border-b-2 border-primary text-primary'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    Upcoming
                </button>
                <button
                    onClick={() => setActiveTab('book')}
                    className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'book'
                            ? 'border-b-2 border-primary text-primary'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    Book New Class
                </button>
            </div>

            {activeTab === 'upcoming' && (
                <div className="space-y-4">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-primary/10 flex justify-between items-center">
                        <div>
                            <div className="font-bold text-lg text-primary">Vinyasa Flow</div>
                            <div className="text-sm text-text/70">Today, 6:00 PM - 6:45 PM IST</div>
                        </div>
                        <button className="px-4 py-2 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded hover:bg-secondary transition-colors">
                            Join Link
                        </button>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-primary/10 flex justify-between items-center opacity-60">
                        <div>
                            <div className="font-bold text-lg text-primary">Hatha Yoga</div>
                            <div className="text-sm text-text/70">Tomorrow, 7:00 AM - 7:45 AM IST</div>
                        </div>
                        <button disabled className="px-4 py-2 border border-gray-300 text-gray-400 text-xs font-bold uppercase tracking-widest rounded">
                            Upcoming
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'book' && (
                <div className="bg-white p-8 rounded-lg shadow-sm border border-primary/10">
                    <h2 className="font-serif text-2xl text-primary mb-6">Select a Batch</h2>

                    <div className="mb-8">
                        <h3 className="font-bold text-sm text-text/60 uppercase tracking-widest mb-4">Morning Batches (IST)</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {slots.morning.map((slot) => (
                                <button
                                    key={slot}
                                    onClick={() => setSelectedSlot(slot)}
                                    className={`p-3 rounded border text-sm transition-all ${selectedSlot === slot
                                            ? 'bg-primary text-white border-primary font-bold'
                                            : 'border-gray-200 hover:border-primary/50 text-text/80'
                                        }`}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="font-bold text-sm text-text/60 uppercase tracking-widest mb-4">Evening Batches (IST)</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {slots.evening.map((slot) => (
                                <button
                                    key={slot}
                                    onClick={() => setSelectedSlot(slot)}
                                    className={`p-3 rounded border text-sm transition-all ${selectedSlot === slot
                                            ? 'bg-primary text-white border-primary font-bold'
                                            : 'border-gray-200 hover:border-primary/50 text-text/80'
                                        }`}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                    </div>

                    {selectedSlot && (
                        <div className="p-6 bg-accent/10 rounded-lg border border-accent/20">
                            <div className="flex items-start gap-3 mb-6">
                                <input type="checkbox" id="recurring" className="mt-1" />
                                <label htmlFor="recurring" className="text-sm text-text/80">
                                    <strong>Make this my recurring slot?</strong>
                                    <br />
                                    <span className="text-xs opacity-70">We will automatically book this time for you every weekday. You can cancel anytime.</span>
                                </label>
                            </div>

                            <button className="w-full py-3 bg-secondary text-white font-bold uppercase tracking-widest rounded hover:bg-primary transition-colors">
                                Confirm Booking for {selectedSlot}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
