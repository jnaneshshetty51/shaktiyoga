"use client";

import DTable from "@/components/admin/DTable";
import { mockSubscriptions, Subscription } from "@/utils/adminData";

export default function AdminSubscriptionsPage() {
    const columns = [
        { header: "User", accessor: "userName" as keyof Subscription, className: "font-bold text-gray-800" },
        { header: "Plan", accessor: "plan" as keyof Subscription },
        { header: "Amount", accessor: (sub: Subscription) => `$${sub.amount}` },
        {
            header: "Status",
            accessor: (sub: Subscription) => (
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${sub.status === 'Active' ? 'bg-green-100 text-green-800' :
                        sub.status === 'Trial' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                    }`}>
                    {sub.status}
                </span>
            )
        },
        { header: "Renewal Date", accessor: "renewalDate" as keyof Subscription },
    ];

    const handleCreate = () => {
        alert("Create Subscription Modal would open here.");
    };

    const handleAction = (sub: Subscription, action: string) => {
        alert(`${action} Subscription for ${sub.userName}`);
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-serif text-3xl text-gray-800 mb-2">Subscriptions</h1>
                <p className="text-gray-500">Manage member plans, billing, and renewals.</p>
            </div>

            <DTable
                data={mockSubscriptions}
                columns={columns}
                title="Active Subscriptions"
                onCreate={handleCreate}
                actions={(sub) => (
                    <div className="flex justify-end gap-2">
                        <button onClick={() => handleAction(sub, 'Edit')} className="text-primary hover:text-secondary text-xs font-bold uppercase tracking-wider">Edit</button>
                        <button onClick={() => handleAction(sub, 'Cancel')} className="text-red-400 hover:text-red-600 text-xs font-bold uppercase tracking-wider">Cancel</button>
                    </div>
                )}
            />
        </div>
    );
}
