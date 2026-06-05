"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DTable from "@/components/admin/DTable";

export type User = {
    id: string;
    name: string;
    email: string;
    role: string;
    status: 'Active' | 'Inactive' | 'Trial';
    plan?: string;
    lastLogin: string;
    joinedAt: string;
};

function UsersDashboard() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const router = useRouter();
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', role: 'MEMBER_EVERYDAY' });
    const [error, setError] = useState('');

    useEffect(() => {
        if (searchParams.get('action') === 'add') {
            setIsModalOpen(true);
            setIsEditMode(false);
        }
        fetchUsers();
    }, [searchParams]);

    async function fetchUsers() {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data.users || []);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        const url = isEditMode ? `/api/admin/users/${editingUserId}` : '/api/admin/users';
        const method = isEditMode ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || `Failed to ${isEditMode ? 'update' : 'create'} user`);
            }

            // Success
            setIsModalOpen(false);
            setFormData({ name: '', email: '', role: 'MEMBER_EVERYDAY' });
            setEditingUserId(null);
            
            if (!isEditMode && searchParams.get('action') === 'add') {
                router.replace('/admin/users'); // remove action=add from URL
            }
            
            fetchUsers(); // refresh data
            
            if (!isEditMode) {
                alert('User added successfully! Their temporary password is: TempPassword123!');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns = [
        { header: "Name", accessor: "name" as keyof User, className: "font-bold text-gray-800", sortable: true },
        { header: "Email", accessor: "email" as keyof User, sortable: true },
        {
            header: "Role",
            accessor: (user: User) => (
                <span className="capitalize bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
                    {user.role.replace('MEMBER_', '').replace('SUPER_', '').replace('_', ' ')}
                </span>
            ),
            sortable: true
        },
        {
            header: "Status",
            accessor: (user: User) => (
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${user.status === 'Active' ? 'bg-green-100 text-green-800' :
                        user.status === 'Trial' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-500'
                    }`}>
                    {user.status}
                </span>
            ),
            sortable: true
        },
        { header: "Last Login", accessor: "lastLogin" as keyof User, sortable: true },
    ];

    const filters = [
        {
            key: 'status',
            label: 'Status',
            options: [
                { label: 'Active', value: 'Active' },
                { label: 'Trial', value: 'Trial' },
                { label: 'Inactive', value: 'Inactive' },
            ]
        },
        {
            key: 'role',
            label: 'Role',
            options: [
                { label: 'Everyday Yoga', value: 'MEMBER_EVERYDAY' },
                { label: 'Yoga Therapy', value: 'MEMBER_THERAPY' },
                { label: 'Trial User', value: 'TRIAL' },
                { label: 'Staff / Admin', value: 'SUPER_ADMIN' },
            ]
        }
    ];

    const handleEdit = (user: User) => {
        setFormData({ name: user.name, email: user.email, role: user.role });
        setEditingUserId(user.id);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleDelete = async (user: User) => {
        if (confirm(`Are you sure you want to delete ${user.name}?\n\nThis cannot be undone.`)) {
            try {
                const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
                const data = await res.json();
                
                if (!res.ok) {
                    throw new Error(data.error || 'Failed to delete user');
                }
                
                fetchUsers();
            } catch (err: any) {
                alert(`Error: ${err.message}`);
            }
        }
    };

    const handleBulkDelete = async (ids: string[]) => {
        if (confirm(`Are you sure you want to delete ${ids.length} users?`)) {
            let successCount = 0;
            let failCount = 0;
            
            for (const id of ids) {
                try {
                    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
                    if (res.ok) successCount++;
                    else failCount++;
                } catch (e) {
                    failCount++;
                }
            }
            
            alert(`Bulk delete complete. Successfully deleted ${successCount} users. Failed: ${failCount}`);
            fetchUsers();
        }
    };

    if (loading) {
        return (
            <div>
                <div className="mb-8">
                    <h1 className="font-serif text-3xl text-gray-800 mb-2">User Management</h1>
                    <p className="text-gray-500">Manage all registered users, members, and staff.</p>
                </div>
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-serif text-3xl text-gray-800 mb-2">User Management</h1>
                <p className="text-gray-500">Manage all registered users, members, and staff.</p>
            </div>

            <DTable
                data={users}
                columns={columns}
                title="All Users"
                searchable={true}
                filters={filters}
                enableBulkActions={true}
                onCreate={() => {
                    setFormData({ name: '', email: '', role: 'MEMBER_EVERYDAY' });
                    setIsEditMode(false);
                    setIsModalOpen(true);
                }}
                onBulkDelete={handleBulkDelete}
                actions={(user) => (
                    <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(user)} className="text-primary hover:text-secondary text-xs font-bold uppercase tracking-wider">Edit</button>
                        <button onClick={() => handleDelete(user)} className="text-red-400 hover:text-red-600 text-xs font-bold uppercase tracking-wider">Delete</button>
                    </div>
                )}
            />

            {/* Add/Edit Member Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-serif text-2xl text-primary">{isEditMode ? 'Edit Member' : 'Add New Member'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
                        </div>
                        
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-100">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Full Name</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full p-2 border border-gray-200 rounded focus:border-primary focus:outline-none" 
                                    placeholder="Jane Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Email Address</label>
                                <input 
                                    type="email" 
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full p-2 border border-gray-200 rounded focus:border-primary focus:outline-none disabled:bg-gray-50" 
                                    placeholder="jane@example.com"
                                    disabled={isEditMode} // Usually we don't want to edit emails freely, but if we do, we can remove disabled
                                />
                                {isEditMode && <p className="text-[10px] text-gray-400 mt-1">Email addresses cannot be changed.</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Assigned Role</label>
                                <select 
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                    className="w-full p-2 border border-gray-200 rounded focus:border-primary focus:outline-none bg-white"
                                >
                                    <option value="VISITOR">Visitor (No Access)</option>
                                    <option value="TRIAL">Trial User</option>
                                    <option value="MEMBER_EVERYDAY">Member - Everyday Yoga</option>
                                    <option value="MEMBER_THERAPY">Member - Yoga Therapy</option>
                                    <option value="TEACHER">Yoga Teacher</option>
                                    <option value="SUPER_ADMIN">Admin / Staff</option>
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
                                    {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Add User')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AdminUsersPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <UsersDashboard />
        </Suspense>
    );
}
