"use client";

import { useState, useEffect } from "react";
import { PageHeader, Tabs, EmptyState, Badge } from "@/components/admin";
import { DataTable, Column } from "@/components/admin";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye } from "react-icons/fa";

interface Story {
  id: string;
  userId: string;
  user: { id: string; name: string };
  title: string;
  content: string;
  status: "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED";
  createdAt: string;
}

const tabs = [
  { label: "All Stories", value: "all" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Pending", value: "PENDING" },
  { label: "Drafts", value: "DRAFT" },
];

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchStories();
  }, [activeTab]);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/content");
      if (response.ok) {
        const data = await response.json();
        setStories(data.stories || []);
      }
    } catch (error) {
      console.error("Failed to fetch stories:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Story["status"]) => {
    switch (status) {
      case "PUBLISHED":
        return <Badge variant="success">Published</Badge>;
      case "PENDING":
        return <Badge variant="warning">Pending</Badge>;
      case "DRAFT":
        return <Badge variant="default">Draft</Badge>;
      case "REJECTED":
        return <Badge variant="error">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const columns: Column<Story & { actions?: string }>[] = [
    {
      key: "title",
      header: "Story",
      render: (story) => (
        <div>
          <div className="font-medium text-gray-900 line-clamp-1">{story.title}</div>
          <div className="text-sm text-gray-500 line-clamp-2 mt-1">{story.content}</div>
        </div>
      ),
    },
    {
      key: "user",
      header: "Author",
      render: (story) => (
        <div className="text-sm">{story.user?.name || "Anonymous"}</div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (story) => getStatusBadge(story.status),
    },
    {
      key: "createdAt",
      header: "Submitted",
      render: (story) => (
        <span className="text-sm text-gray-500">
          {new Date(story.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (story) => (
        <div className="flex items-center gap-2 justify-end">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Preview">
            <FaEye className="text-gray-500" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
            <FaEdit className="text-gray-500" />
          </button>
          <button className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
            <FaTrash className="text-red-500" />
          </button>
        </div>
      ),
    },
  ];

  const filteredStories = stories.filter((story) => {
    if (activeTab !== "all" && story.status !== activeTab) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        story.title.toLowerCase().includes(query) ||
        story.content.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Member Stories"
        subtitle="View and manage yoga journey stories from your community members"
        actions={
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
            <FaPlus />
            Add Story
          </button>
        }
      />

      {/* Tabs and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <Tabs
          tabs={tabs.map((t) => ({
            ...t,
            count: t.value === "all" ? stories.length : stories.filter((s) => s.status === t.value).length,
          }))}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search stories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Stories Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredStories.length === 0 && !loading ? (
          <EmptyState
            icon="📖"
            title="No stories found"
            description={
              activeTab === "all"
                ? "Member stories will appear here"
                : `No ${activeTab.toLowerCase()} stories`
            }
          />
        ) : (
          <DataTable
            columns={columns}
            data={filteredStories}
            loading={loading}
            emptyMessage="No stories matching your criteria"
          />
        )}
      </div>
    </div>
  );
}