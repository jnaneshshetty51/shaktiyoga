"use client";

import DTable from "@/components/admin/DTable";
import { mockBookings, Booking } from "@/utils/adminData";

export default function AdminBookingsPage() {
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
                            'bg-gray-100 text-gray-500'
                    }`}>
                    {bk.status}
                </span>
            )
        },
    ];

    const handleCreate = () => {
        alert("Create Booking Modal would open here.");
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-serif text-3xl text-gray-800 mb-2">Bookings & Trials</h1>
                <p className="text-gray-500">Manage 1:1 therapy sessions, consultations, and trial bookings.</p>
            </div>

            <DTable
                data={mockBookings}
                columns={columns}
                title="All Bookings"
                onCreate={handleCreate}
                actions={(bk) => (
                    <div className="flex justify-end gap-2">
                        <button className="text-primary hover:text-secondary text-xs font-bold uppercase tracking-wider">Edit</button>
                        <button className="text-red-400 hover:text-red-600 text-xs font-bold uppercase tracking-wider">Cancel</button>
                    </div>
                )}
            />
        </div>
    );
}
