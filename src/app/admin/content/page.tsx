"use client";

import { useState, useEffect } from "react";
import { PageHeader, Tabs, EmptyState, Modal, Badge, StatusBadge } from "@/components/admin";
import { DataTable, Column } from "@/components/admin";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye, FaImage, FaCalendarAlt, FaUser } from "react-icons/fa";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  category: string;
  author: string;
  featuredImage: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const categories = [
  "All Categories" ,
  "Yoga Tips",
  "Wellness",
  "Lifestyle",
  "Meditation",
  "Breathwork",
  "Success Stories",
  "Announcements",
];

const tabs = [
  { label: "All Posts", value: "all" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Drafts", value: "DRAFT" },
  { label: "Archived", value: "ARCHIVED" },
];

export default function ContentPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    fetchPosts();
  }, [activeTab, selectedCategory]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== "all") params.set("status", activeTab);
      if (selectedCategory !== "All Categories") params.set("category", selectedCategory);
      
      const response = await fetch(`/api/admin/content?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts();
  };

  const handlePreview = (post: BlogPost) => {
    setSelectedPost(post);
    setShowPreviewModal(true);
  };

  const columns: Column<BlogPost & { actions?: string }>[] = [
    {
      key: "title",
      header: "Post",
      render: (post) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            {post.featuredImage ? (
              <img src={post.featuredImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <FaImage className="text-gray-300 text-xl" />
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900 max-w-xs truncate">{post.title}</div>
            <div className="text-sm text-gray-500 truncate max-w-xs">{post.excerpt || "No excerpt"}</div>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (post) => (
        <Badge variant="default">{post.category}</Badge>
      ),
    },
    {
      key: "author",
      header: "Author",
      render: (post) => (
        <div className="flex items-center gap-2">
          <FaUser className="text-gray-400 text-sm" />
          <span className="text-sm">{post.author}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (post) => <StatusBadge status={post.status} />,
    },
    {
      key: "publishedAt",
      header: "Published",
      render: (post) => (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FaCalendarAlt className="text-gray-400" />
          {post.publishedAt
            ? new Date(post.publishedAt).toLocaleDateString()
            : post.status === "PUBLISHED"
            ? "—"
            : "—"}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (post) => (
        <span className="text-sm text-gray-500">
          {new Date(post.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (post) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePreview(post)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Preview"
          >
            <FaEye className="text-gray-500" />
          </button>
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Edit"
          >
            <FaEdit className="text-gray-500" />
          </button>
          <button
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <FaTrash className="text-red-400" />
          </button>
        </div>
      ),
    },
  ];

  const counts = {
    all: posts.length,
    PUBLISHED: posts.filter((p) => p.status === "PUBLISHED").length,
    DRAFT: posts.filter((p) => p.status === "DRAFT").length,
    ARCHIVED: posts.filter((p) => p.status === "ARCHIVED").length,
  };

  return (
    <div>
      <PageHeader
        title="Content Management"
        subtitle="Create and manage blog posts, stories, and site content"
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            <FaPlus />
            New Post
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <Tabs 
          tabs={tabs.map(t => ({ ...t, count: counts[t.value as keyof typeof counts] || 0 }))} 
          activeTab={activeTab} 
          onChange={setActiveTab} 
        />
        
        <div className="flex items-center gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <form onSubmit={handleSearch} className="flex items-center">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {posts.length === 0 && !loading ? (
          <EmptyState
            icon="📝"
            title="No posts found"
            description={activeTab === "all" ? "Start by creating your first blog post" : `No posts in ${activeTab.toLowerCase()} status`}
            action={{
              label: "Create Post",
              onClick: () => setShowAddModal(true),
            }}
          />
        ) : (
          <DataTable
            columns={columns}
            data={posts}
            loading={loading}
            emptyMessage="No posts matching your criteria"
          />
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create New Post"
        subtitle="Write and publish a new blog post"
        size="xl"
        footer={
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Save as Draft
            </button>
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              Publish
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Enter post title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <option>Yoga Tips</option>
                <option>Wellness</option>
                <option>Lifestyle</option>
                <option>Meditation</option>
                <option>Breathwork</option>
                <option>Success Stories</option>
                <option>Announcements</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Author name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
            <textarea
              rows={2}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              placeholder="Brief description for previews and SEO..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex gap-4">
                <button className="text-sm text-gray-600 hover:text-gray-900 font-medium">B</button>
                <button className="text-sm text-gray-600 hover:text-gray-900 italic">I</button>
                <button className="text-sm text-gray-600 hover:text-gray-900 underline">U</button>
                <span className="text-gray-300">|</span>
                <button className="text-sm text-gray-600 hover:text-gray-900">H1</button>
                <button className="text-sm text-gray-600 hover:text-gray-900">H2</button>
                <button className="text-sm text-gray-600 hover:text-gray-900">H3</button>
                <span className="text-gray-300">|</span>
                <button className="text-sm text-gray-600 hover:text-gray-900">• List</button>
                <button className="text-sm text-gray-600 hover:text-gray-900">1. List</button>
                <span className="text-gray-300">|</span>
                <button className="text-sm text-gray-600 hover:text-gray-900">Link</button>
                <button className="text-sm text-gray-600 hover:text-gray-900">Image</button>
              </div>
              <textarea
                rows={12}
                className="w-full px-4 py-3 text-sm focus:outline-none resize-none"
                placeholder="Write your blog post content here..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image</label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <FaImage className="text-gray-300 text-3xl mx-auto mb-2" />
                <p className="text-sm text-gray-500">Click or drag to upload</p>
                <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title (SEO)</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="SEO optimized title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description (SEO)</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  placeholder="Description for search engines..."
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title={selectedPost?.title || ""}
        subtitle={selectedPost?.status}
        size="lg"
      >
        {selectedPost && (
          <div className="space-y-6">
            {selectedPost.featuredImage && (
              <img
                src={selectedPost.featuredImage}
                alt=""
                className="w-full h-48 object-cover rounded-lg"
              />
            )}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>By {selectedPost.author}</span>
              <span>•</span>
              <span>{new Date(selectedPost.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <Badge variant="default">{selectedPost.category}</Badge>
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-600">{selectedPost.excerpt}</p>
              <hr className="my-6" />
              <div className="text-gray-800 whitespace-pre-wrap">
                {selectedPost.content || "No content yet..."}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
