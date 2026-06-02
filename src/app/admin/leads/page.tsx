"use client";

import { useState, useEffect } from "react";
import { PageHeader, Tabs, EmptyState, Modal } from "@/components/admin";
import { DataTable, Column } from "@/components/admin";
import { StatusBadge, Badge } from "@/components/admin";
import { FaPlus, FaSearch, FaFilter, FaUserPlus } from "react-icons/fa";
import { FormField, SelectField, validateEmail, validateRequired, validatePhone, useTypeahead } from "@/components/admin";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  source: string;
  status: string;
  notes: string | null;
  trialRequestedAt: string | null;
  trialDate: string | null;
  trialAttended: boolean | null;
  createdAt: string;
  assignedTo: { id: string; name: string } | null;
  _count: { activities: number };
}

const tabs = [
  { label: "All Leads", value: "all" },
  { label: "New", value: "NEW" },
  { label: "Contacted", value: "CONTACTED" },
  { label: "Trial", value: "TRIAL" },
  { label: "Converted", value: "CONVERTED" },
  { label: "Lost", value: "LOST" },
];

const sourceOptions = [
  { value: "WEBSITE", label: "Website" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "REFERRAL", label: "Referral" },
  { value: "SOCIAL_MEDIA", label: "Social Media" },
  { value: "OTHER", label: "Other" },
];

const statusOptions = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "TRIAL", label: "Trial" },
  { value: "CONVERTED", label: "Converted" },
  { value: "LOST", label: "Lost" },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    source: "WEBSITE",
    status: "NEW",
    notes: "",
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    
    // Validate
    let error: string | undefined;
    if (name === "name") error = validateRequired(formData.name, "Name");
    if (name === "email") error = validateEmail(formData.email);
    setErrors((prev) => ({ ...prev, [name]: error || "" }));
  };

  useEffect(() => {
    fetchLeads();
  }, [activeTab]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== "all") params.set("status", activeTab);
      if (searchQuery) params.set("search", searchQuery);

      const response = await fetch(`/api/admin/leads?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLeads(data);
      }
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads();
  };

  const columns: Column<Lead>[] = [
    {
      key: "name",
      header: "Name",
      render: (lead) => (
        <div>
          <div className="font-medium text-gray-900">{lead.name}</div>
          <div className="text-gray-500 text-sm">{lead.email}</div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Contact",
      render: (lead) => (
        <div className="text-sm">
          {lead.phone && <div>{lead.phone}</div>}
          {lead.country && <div className="text-gray-500">{lead.country}</div>}
        </div>
      ),
    },
    {
      key: "source",
      header: "Source",
      render: (lead) => (
        <Badge variant="default">{sourceOptions.find(s => s.value === lead.source)?.label || lead.source}</Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (lead) => <StatusBadge status={lead.status} />,
    },
    {
      key: "trialDate",
      header: "Trial",
      render: (lead) => (
        lead.trialDate ? (
          <div className="text-sm">
            <div>{new Date(lead.trialDate).toLocaleDateString()}</div>
            {lead.trialAttended === false && (
              <span className="text-orange-500 text-xs">Pending</span>
            )}
          </div>
        ) : (
          <span className="text-gray-400 text-sm">Not scheduled</span>
        )
      ),
    },
    {
      key: "assignedTo",
      header: "Assigned",
      render: (lead) => (
        lead.assignedTo ? (
          <span className="text-sm">{lead.assignedTo.name}</span>
        ) : (
          <span className="text-gray-400 text-sm">Unassigned</span>
        )
      ),
    },
    {
      key: "createdAt",
      header: "Added",
      render: (lead) => (
        <span className="text-sm text-gray-500">
          {new Date(lead.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  const counts = {
    all: leads.length,
    NEW: leads.filter((l) => l.status === "NEW").length || 0,
    CONTACTED: leads.filter((l) => l.status === "CONTACTED").length || 0,
    TRIAL: leads.filter((l) => l.status === "TRIAL").length || 0,
    CONVERTED: leads.filter((l) => l.status === "CONVERTED").length || 0,
    LOST: leads.filter((l) => l.status === "LOST").length || 0,
  };

  return (
    <div>
      <PageHeader
        title="Leads"
        subtitle="Track and manage potential customers from inquiry to conversion"
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            <FaPlus />
            Add Lead
          </button>
        }
      />

      {/* Tabs and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <Tabs tabs={tabs.map(t => ({ ...t, count: counts[t.value as keyof typeof counts] || 0 }))} activeTab={activeTab} onChange={setActiveTab} />
        
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <button
            type="submit"
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaFilter className="text-gray-500" />
          </button>
        </form>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {leads.length === 0 && !loading ? (
          <EmptyState
            icon="📋"
            title="No leads found"
            description={activeTab === "all" ? "Start by adding your first lead" : `No leads in ${activeTab.toLowerCase()} status`}
            action={{
              label: "Add Lead",
              onClick: () => setShowAddModal(true),
            }}
          />
        ) : (
          <DataTable
            columns={columns}
            data={leads}
            loading={loading}
            emptyMessage="No leads matching your criteria"
          />
        )}
      </div>

      {/* Add Lead Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Lead"
        subtitle="Enter the lead's information"
        size="md"
        footer={
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowAddModal(false);
              }}
              className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              Create Lead
            </button>
          </div>
        }
      >
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowAddModal(false); }}>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Name"
              name="name"
              type="text"
              required
              placeholder="John Doe"
              value={formData.name}
              onChange={handleFormChange}
              onBlur={handleFormBlur}
              error={errors.name}
              touched={touched.name}
            />
            <FormField
              label="Email"
              name="email"
              type="email"
              required
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleFormChange}
              onBlur={handleFormBlur}
              error={errors.email}
              touched={touched.email}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Phone"
              name="phone"
              type="tel"
              placeholder="+1 234 567 8900"
              value={formData.phone}
              onChange={handleFormChange}
              onBlur={handleFormBlur}
              error={errors.phone}
              touched={touched.phone}
            />
            <FormField
              label="Country"
              name="country"
              type="text"
              placeholder="United States"
              value={formData.country}
              onChange={handleFormChange}
              onBlur={handleFormBlur}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Source"
              name="source"
              options={sourceOptions}
              placeholder="Select source"
              value={formData.source}
              onChange={handleFormChange}
              onBlur={handleFormBlur}
            />
            <SelectField
              label="Status"
              name="status"
              options={statusOptions}
              placeholder="Select status"
              value={formData.status}
              onChange={handleFormChange}
              onBlur={handleFormBlur}
            />
          </div>

          <FormField
            label="Notes"
            name="notes"
            type="textarea"
            placeholder="Any additional notes about this lead..."
            value={formData.notes}
            onChange={handleFormChange}
            onBlur={handleFormBlur}
          />
        </form>
      </Modal>
    </div>
  );
}
