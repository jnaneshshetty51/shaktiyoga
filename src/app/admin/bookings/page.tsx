"use client";

import { useEffect, useState, Suspense } from "react";
import DTable from "@/components/admin/DTable";

export type Booking = {
    id: string;
    userId: string;
    userName: string;
    type: 'Therapy' | 'Consultation' | 'Special Session';
    date: string;
    time: string;
    status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';
    teacher: string;
};

function BookingsDashboard() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Booking Form State
    const [formData, setFormData] = useState({
        userId: '',
        type: 'Therapy',
        date: '',
        time: '',
        status: 'Confirmed'
    });
    
    // Basic User List for creation dropdown (optional to fetch, but let's assume we can fetch basic list)
    const [usersList, setUsersList] = useState<{id: string, name: string}[]>([]);

    useEffect(() => {
        fetchBookings();
        fetchUsersList();
    }, []);

    async function fetchBookings() {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/bookings');
            if (response.ok) {
                const data = await response.json();
                setBookings(data.bookings || []);
            }
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setLoading(false);
        }
    }
    
    async function fetchUsersList() {
        try {
            const response = await fetch('/api/admin/users');
            if (response.ok) {
                const data = await response.json();
                setUsersList(data.users || []);
                if (data.users && data.users.length > 0) {
                    setFormData(prev => ({...prev, userId: data.users[0].id}));
                }
            }
        } catch (error) {
            console.error('Failed to fetch users list:', error);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const url = isEditMode ? `/api/admin/bookings/${editingBookingId}` : '/api/admin/bookings';
        const method = isEditMode ? 'PUT' : 'POST';
        
        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || `Failed to ${isEditMode ? 'update' : 'create'} booking`);
            }
            
            setIsModalOpen(false);
            setEditingBookingId(null);
            fetchBookings();
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreate = () => {
        setIsEditMode(false);
        setFormData(prev => ({
            ...prev,
            type: 'Therapy',
            date: new Date().toISOString().split('T')[0],
            time: '09:00',
            status: 'Confirmed'
        }));
        setIsModalOpen(true);
    };

    const handleEdit = (bk: Booking) => {
        // Extract time roughly to HH:mm format if possible, otherwise default to 09:00
        let timeFormatted = '09:00';
        try {
            // Very rough parsing assuming string like "09:00 AM IST"
            const parts = bk.time.split(' ');
            if (parts.length >= 2) {
                let [hours, mins] = parts[0].split(':');
                if (parts[1] === 'PM' && parseInt(hours) !== 12) hours = (parseInt(hours) + 12).toString();
                if (parts[1] === 'AM' && parseInt(hours) === 12) hours = '00';
                timeFormatted = `${hours.padStart(2, '0')}:${mins}`;
            }
        } catch (e) {}

        setFormData({
            userId: bk.userId,
            type: bk.type,
            date: bk.date,
            time: timeFormatted,
            status: bk.status
        });
        setEditingBookingId(bk.id);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleDelete = async (bk: Booking) => {
        if (confirm(`Are you sure you want to delete this booking for ${bk.userName}?`)) {
            try {
                const res = await fetch(`/api/admin/bookings/${bk.id}`, { method: 'DELETE' });
                if (!res.ok) throw new Error('Failed to delete booking');
                fetchBookings();
            } catch (err: any) {
                alert(`Error: ${err.message}`);
            }
        }
    };

    const columns = [
        { header: "User", accessor: "userName" as keyof Booking, className: "font-bold text-gray-800" },
        { header: "Type", accessor: "type" as keyof Booking },
        { header: "Date", accessor: "date" as keyof Booking },
        { header: "Time", accessor: "time" as keyof Booking },
        { header: "Teacher", accessor: "teacher" as keyof Booking },
        {
            header: "Status",
            accessor: (bk: Booking) => (
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${bk.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                        bk.status === 'Pending' ? 'bg-orange-100 text-orange-800' :
                        bk.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-500'
                    }`}>
                    {bk.status}
                </span>
            )
        },
    ];

    if (loading) {
        return (
            <div>
                <div className="mb-8">
                    <h1 className="font-serif text-3xl text-gray-800 mb-2">Bookings & Trials</h1>
                    <p className="text-gray-500">Manage 1:1 therapy sessions, consultations, and trial bookings.</p>
                </div>
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-serif text-3xl text-gray-800 mb-2">Bookings & Trials</h1>
                <p className="text-gray-500">Manage 1:1 therapy sessions, consultations, and trial bookings.</p>
            </div>

            <DTable
                data={bookings}
                columns={columns}
                title="All Bookings"
                onCreate={handleCreate}
                actions={(bk) => (
                    <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(bk)} className="text-primary hover:text-secondary text-xs font-bold uppercase tracking-wider">Edit</button>
                        <button onClick={() => handleDelete(bk)} className="text-red-400 hover:text-red-600 text-xs font-bold uppercase tracking-wider">Cancel</button>
                    </div>
                )}
            />

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-serif text-2xl text-primary">{isEditMode ? 'Edit Booking' : 'Create Booking'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isEditMode && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Select User</label>
                                    <select 
                                        required
                                        value={formData.userId}
                                        onChange={(e) => setFormData({...formData, userId: e.target.value})}
                                        className="w-full p-2 border border-gray-200 rounded focus:border-primary focus:outline-none bg-white"
                                    >
                                        {usersList.map(u => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Session Type</label>
                                <select 
                                    value={formData.type}
                                    onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                                    className="w-full p-2 border border-gray-200 rounded focus:border-primary focus:outline-none bg-white"
                                    disabled={isEditMode}
                                >
                                    <option value="Therapy">Yoga Therapy</option>
                                    <option value="Consultation">Consultation</option>
                                    <option value="Special Session">Special Session</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Date</label>
                                    <input 
                                        type="date" 
                                        required
                                        value={formData.date}
                                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                                        className="w-full p-2 border border-gray-200 rounded focus:border-primary focus:outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Time</label>
                                    <input 
                                        type="time" 
                                        required
                                        value={formData.time}
                                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                                        className="w-full p-2 border border-gray-200 rounded focus:border-primary focus:outline-none" 
                                    />
                                </div>
                            </div>
                            
                            {isEditMode && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Status</label>
                                    <select 
                                        value={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                                        className="w-full p-2 border border-gray-200 rounded focus:border-primary focus:outline-none bg-white"
                                    >
                                        <option value="Confirmed">Confirmed</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2 border border-gray-200 text-gray-600 font-bold uppercase tracking-widest rounded hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="flex-1 py-2 bg-primary text-white font-bold uppercase tracking-widest rounded hover:bg-secondary transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Saving...' : (isEditMode ? 'Update' : 'Create')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AdminBookingsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BookingsDashboard />
        </Suspense>
    );
}
