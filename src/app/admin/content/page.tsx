"use client";

import { useState } from "react";
import DTable from "@/components/admin/DTable";
import { stories, blogPosts } from "@/utils/content";
import { initialGroups } from "@/utils/community";

export default function AdminContentPage() {
    const [activeTab, setActiveTab] = useState<'stories' | 'blog' | 'whatsapp'>('stories');

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-serif text-3xl text-gray-800 mb-2">Content Management</h1>
                <p className="text-gray-500">Manage website content, stories, blog posts, and community links.</p>
            </div>

            <div className="flex gap-4 mb-8 border-b border-gray-200">
                {['stories', 'blog', 'whatsapp'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'stories' && (
                <DTable
                    data={stories}
                    columns={[
                        { header: "Name", accessor: "name", className: "font-bold" },
                        { header: "Location", accessor: "location" },
                        { header: "Plan", accessor: "plan" },
                        { header: "Rating", accessor: (s) => "★".repeat(s.rating) },
                    ]}
                    title="Stories & Testimonials"
                    onCreate={() => alert("Add Story")}
                    actions={() => <button className="text-primary text-xs font-bold uppercase">Edit</button>}
                />
            )}

            {activeTab === 'blog' && (
                <DTable
                    data={blogPosts}
                    columns={[
                        { header: "Title", accessor: "title", className: "font-bold" },
                        { header: "Category", accessor: "category" },
                        { header: "Date", accessor: "date" },
                    ]}
                    title="Blog Posts"
                    onCreate={() => alert("Write Post")}
                    actions={() => <button className="text-primary text-xs font-bold uppercase">Edit</button>}
                />
            )}

            {activeTab === 'whatsapp' && (
                <DTable
                    data={initialGroups}
                    columns={[
                        { header: "Group Name", accessor: "name", className: "font-bold" },
                        { header: "Role", accessor: "role" },
                        { header: "Link", accessor: (g) => <a href={g.whatsappLink} target="_blank" className="text-blue-500 underline truncate block w-32">{g.whatsappLink}</a> },
                    ]}
                    title="WhatsApp Groups"
                    actions={() => <button className="text-primary text-xs font-bold uppercase">Edit</button>}
                />
            )}
        </div>
    );
}
