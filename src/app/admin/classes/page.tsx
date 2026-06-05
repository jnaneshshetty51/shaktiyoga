"use client";

import { useEffect, useState, Suspense } from "react";
import DTable from "@/components/admin/DTable";

export type ClassBatch = {
    id: string;
    name: string;
    type: string;
    teacher: { id: string, name: string };
    schedule: string;
    time: string;
    duration: number;
    maxParticipants: number;
    enrolled: number;
    status: 'ACTIVE' | 'INACTIVE';
};

function ClassesDashboard() {
    const [classes, setClasses] = useState<ClassBatch[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingClassId, setEditingClassId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        planType: 'EVERYDAY_YOGA',
        teacherId: '',
        daysOfWeek: 'Mon, Wed, Fri',
        timeSlot: '07:00 AM',
        active: true
    });
    
    const [teachersList, setTeachersList] = useState<{id: string, name: string}[]>([]);

    useEffect(() => {
        fetchClasses();
        fetchTeachersList();
    }, []);

    async function fetchClasses() {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/classes');
            if (response.ok) {
                const data = await response.json();
                setClasses(data || []);
            }
        } catch (error) {
            console.error('Failed to fetch classes:', error);
        } finally {
            setLoading(false);
        }
    }
    
    async function fetchTeachersList() {
        try {
            const response = await fetch('/api/admin/users'); // Since we don't have a teacher specific route, fetch all users and filter locally or we can use the same
            if (response.ok) {
                const data = await response.json();
                const teachers = (data.users || []).filter((u:any) => u.role === 'TEACHER');
                setTeachersList(teachers);
                if (teachers.length > 0) {
                    setFormData(prev => ({...prev, teacherId: teachers[0].id}));
                }
            }
        } catch (error) {
            console.error('Failed to fetch teachers list:', error);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const url = isEditMode ? `/api/admin/classes/${editingClassId}` : '/api/admin/classes';
        const method = isEditMode ? 'PUT' : 'POST';
        
        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || `Failed to ${isEditMode ? 'update' : 'create'} class batch`);
            }
            
            setIsModalOpen(false);
            setEditingClassId(null);
            fetchClasses();
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
            name: '',
            planType: 'EVERYDAY_YOGA',
            daysOfWeek: 'Mon, Wed, Fri',
            timeSlot: '07:00 AM',
            active: true
        }));
        setIsModalOpen(true);
    };

    const handleEdit = (cls: ClassBatch) => {
        setFormData({
            name: cls.name,
            planType: cls.type,
            teacherId: cls.teacher.id,
            daysOfWeek: cls.schedule,
            timeSlot: cls.time,
            active: cls.status === 'ACTIVE'
        });
        setEditingClassId(cls.id);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleDelete = async (cls: ClassBatch) => {
        if (confirm(`Are you sure you want to deactivate the class batch "${cls.name}"?`)) {
            try {
                const res = await fetch(`/api/admin/classes/${cls.id}`, { method: 'DELETE' });
                if (!res.ok) throw new Error('Failed to deactivate class batch');
                fetchClasses();
            } catch (err: any) {
                alert(`Error: ${err.message}`);
            }
        }
    };

    const columns = [
        { header: "Batch Name", accessor: "name" as keyof ClassBatch, className: "font-bold text-gray-800", sortable: true },
        {
            header: "Type",
            accessor: (cls: ClassBatch) => (
                <span className="capitalize text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {cls.type.replace('_', ' ')}
                </span>
            ),
            sortable: true
        },
        { header: "Teacher", accessor: (cls: ClassBatch) => cls.teacher.name, sortable: true },
        { header: "Schedule", accessor: "schedule" as keyof ClassBatch },
        { header: "Time", accessor: "time" as keyof ClassBatch, sortable: true },
        {
            header: "Capacity",
            accessor: (cls: ClassBatch) => (
                <div className="flex items-center gap-2 w-full max-w-[100px]">
                    <span className="text-xs font-medium w-8 text-right">{cls.enrolled}/{cls.maxParticipants}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${cls.enrolled >= cls.maxParticipants ? 'bg-red-500' : 'bg-primary'}`}
                            style={{ width: `${Math.min(100, (cls.enrolled / cls.maxParticipants) * 100)}%` }}
                        ></div>
                    </div>
                </div>
            )
        },
        {
            header: "Status",
            accessor: (cls: ClassBatch) => (
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${cls.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                    }`}>
                    {cls.status}
                </span>
            ),
            sortable: true
        },
    ];

    if (loading) {
        return (
            <div>
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="font-serif text-3xl text-gray-800 mb-2">Class Batches</h1>
                        <p className="text-gray-500">Manage recurring yoga batches, teachers, and schedules.</p>
                    </div>
                </div>
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="font-serif text-3xl text-gray-800 mb-2">Class Batches</h1>
                    <p className="text-gray-500">Manage recurring yoga batches, teachers, and schedules.</p>
                </div>
            </div>

            <DTable
                data={classes}
                columns={columns}
                title="All Class Batches"
                onCreate={handleCreate}
                actions={(cls) => (
                    <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(cls)} className="text-primary hover:text-secondary text-xs font-bold uppercase tracking-wider">Edit</button>
                        <button onClick={() => handleDelete(cls)} className="text-red-400 hover:text-red-600 text-xs font-bold uppercase tracking-wider">Deactivate</button>
                    </div>
                )}
            />

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-serif text-2xl text-primary">{isEditMode ? 'Edit Class Batch' : 'Create Class Batch'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Batch Name</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full p-2 border border-gray-200 rounded focus:border-primary focus:outline-none" 
                                    placeholder="e.g. Morning Flow"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Plan Type</label>
                                <select 
                                    value={formData.planType}
                                    onChange={(e) => setFormData({...formData, planType: e.target.value})}
                                    className="w-full p-2 border border-gray-200 rounded focus:border-primary focus:outline-none bg-white"
                                >
                                    <option value="EVERYDAY_YOGA">Everyday Yoga</option>
                                    <option value="YOGA_THERAPY">Yoga Therapy</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Assign Teacher</label>
                                <select 
                                    required
                                    value={formData.teacherId}
                                    onChange={(e) => setFormData({...formData, teacherId: e.target.value})}
                                    className="w-full p-2 border border-gray-200 rounded focus:border-primary focus:outline-none bg-white"
                                >
                                    {teachersList.length === 0 && <option value="">No teachers available</option>}
                                    {teachersList.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Days of Week</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.daysOfWeek}
                                    onChange={(e) => setFormData({...formData, daysOfWeek: e.target.value})}
                                    className="w-full p-2 border border-gray-200 rounded focus:border-primary focus:outline-none" 
                                    placeholder="Mon, Wed, Fri"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Time Slot</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.timeSlot}
                                    onChange={(e) => setFormData({...formData, timeSlot: e.target.value})}
                                    className="w-full p-2 border border-gray-200 rounded focus:border-primary focus:outline-none" 
                                    placeholder="07:00 AM"
                                />
                            </div>
                            
                            {isEditMode && (
                                <div className="flex items-center gap-2 mt-2">
                                    <input 
                                        type="checkbox" 
                                        id="activeStatus"
                                        checked={formData.active}
                                        onChange={(e) => setFormData({...formData, active: e.target.checked})}
                                        className="w-4 h-4 text-primary"
                                    />
                                    <label htmlFor="activeStatus" className="text-sm font-bold text-gray-700">Active Batch</label>
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
                                    {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Batch' : 'Create Batch')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AdminClassesPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ClassesDashboard />
        </Suspense>
    );
}
