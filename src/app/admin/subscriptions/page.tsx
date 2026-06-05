"use client";

import { useEffect, useState, Suspense } from "react";
import DTable from "@/components/admin/DTable";

export type Subscription = {
    id: string;
    userId: string;
    userName: string;
    plan: 'Everyday Yoga' | 'Yoga Therapy' | 'Trial';
    amount: number;
    status: 'Active' | 'Cancelled' | 'Paused' | 'Trial' | 'Expired';
    renewalDate: string;
};

function SubscriptionsDashboard() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingSubId, setEditingSubId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        userId: '',
        plan: 'Everyday Yoga',
        amount: 49,
        status: 'Active',
        renewalDate: ''
    });
    
    const [usersList, setUsersList] = useState<{id: string, name: string}[]>([]);

    useEffect(() => {
        fetchSubscriptions();
        fetchUsersList();
    }, []);

    async function fetchSubscriptions() {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/subscriptions');
            if (response.ok) {
                const data = await response.json();
                setSubscriptions(data.subscriptions || []);
            }
        } catch (error) {
            console.error('Failed to fetch subscriptions:', error);
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
        
        const url = isEditMode ? `/api/admin/subscriptions/${editingSubId}` : '/api/admin/subscriptions';
        const method = isEditMode ? 'PUT' : 'POST';
        
        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || `Failed to ${isEditMode ? 'update' : 'create'} subscription`);
            }
            
            setIsModalOpen(false);
            setEditingSubId(null);
            fetchSubscriptions();
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
            plan: 'Everyday Yoga',
            amount: 49,
            status: 'Active',
            renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }));
        setIsModalOpen(true);
    };

    const handleEdit = (sub: Subscription) => {
        setFormData({
            userId: sub.userId,
            plan: sub.plan,
            amount: sub.amount,
            status: sub.status,
            renewalDate: sub.renewalDate
        });
        setEditingSubId(sub.id);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleDelete = async (sub: Subscription) => {
        if (confirm(`Are you sure you want to delete this subscription for ${sub.userName}?`)) {
            try {
                const res = await fetch(`/api/admin/subscriptions/${sub.id}`, { method: 'DELETE' });
                if (!res.ok) throw new Error('Failed to delete subscription');
                fetchSubscriptions();
            } catch (err: any) {
                alert(`Error: ${err.message}`);
            }
        }
    };

    const columns = [
        { header: "User", accessor: "userName" as keyof Subscription, className: "font-bold text-gray-800" },
        { header: "Plan", accessor: "plan" as keyof Subscription },
        { header: "Amount", accessor: (sub: Subscription) => `₹${sub.amount}` }, // Changed to Rupee for standard consistency
        {
            header: "Status",
            accessor: (sub: Subscription) => (
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${sub.status === 'Active' ? 'bg-green-100 text-green-800' :
                        sub.status === 'Trial' ? 'bg-blue-100 text-blue-800' :
                        sub.status === 'Paused' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                    }`}>
                    {sub.status}
                </span>
            )
        },
        { header: "Renewal Date", accessor: "renewalDate" as keyof Subscription },
    ];

    if (loading) {
        return (
            <div>
                <div className="mb-8">
                    <h1 className="font-serif text-3xl text-gray-800 mb-2">Subscriptions</h1>
                    <p className="text-gray-500">Manage member plans, billing, and renewals.</p>
                </div>
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-serif text-3xl text-gray-800 mb-2">Subscriptions</h1>
                <p className="text-gray-500">Manage member plans, billing, and renewals.</p>
            </div>

            <DTable
                data={subscriptions}
                columns={columns}
                title="Active Subscriptions"
                onCreate={handleCreate}
                actions={(sub) => (
                    <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(sub)} className="text-primary hover:text-secondary text-xs font-bold uppercase tracking-wider">Edit</button>
                        <button onClick={() => handleDelete(sub)} className="text-red-400 hover:text-red-600 text-xs font-bold uppercase tracking-wider">Delete</button>
                    </div>
                )}
            />

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-serif text-2xl text-primary">{isEditMode ? 'Edit Subscription' : 'Create Subscription'}</h2>
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
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Plan</label>
                                <select 
                                    value={formData.plan}
                                    onChange={(e) => setFormData({...formData, plan: e.target.value as any})}
                                    className="w-full p-2 border border-gray-200 rounded focus:border-primary focus:outline-none bg-white"
                                >
                                    <option value="Everyday Yoga">Everyday Yoga</option>
                                    <option value="Yoga Therapy">Yoga Therapy</option>
                                    <option value="Trial">Trial</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Amount</label>
                                    <input 
                                        type="number" 
                                        required
                                        min="0"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
                                        className="w-full p-2 border border-gray-200 rounded focus:border-primary focus:outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Renewal Date</label>
                                    <input 
                                        type="date" 
                                        required
                                        value={formData.renewalDate}
                                        onChange={(e) => setFormData({...formData, renewalDate: e.target.value})}
                                        className="w-full p-2 border border-gray-200 rounded focus:border-primary focus:outline-none" 
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Status</label>
                                <select 
                                    value={formData.status}
                                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                                    className="w-full p-2 border border-gray-200 rounded focus:border-primary focus:outline-none bg-white"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Trial">Trial</option>
                                    <option value="Paused">Paused</option>
                                    <option value="Expired">Expired</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>

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

export default function AdminSubscriptionsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SubscriptionsDashboard />
        </Suspense>
    );
}
