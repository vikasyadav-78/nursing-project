import React, { useState, useEffect } from "react";
import { Plus, Search, Trash2, Loader2, Newspaper, AlertTriangle, X, Send, CheckCircle2, FileEdit } from "lucide-react";
import API from "../api/client";
import toast from "react-hot-toast";

const CONTENT_TYPES = [
  "Article",
  "News",
  "Exam Update",
  "Admission Update",
  "Syllabus",
  "College Guide",
  "Exam Prep",
];

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft", color: "bg-slate-100 text-slate-700 border-slate-200" },
  { value: "REVIEW", label: "Under Review", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "PUBLISHED", label: "Published", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: "ARCHIVED", label: "Archived", color: "bg-rose-100 text-rose-700 border-rose-200" },
];

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, blogId: null, blogTitle: "" });

  const [formData, setFormData] = useState({
    title: "",
    code: "",
    contentType: "Article",
    status: "DRAFT",
    description: "",
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await API.get("/blog?status=ALL");
      if (res.data?.success) {
        setBlogs(res.data.data || []);
      }
    } catch (err) {
      toast.error("Failed to load CMS content");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBlog = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/blog", formData);
      if (res.data?.success) {
        toast.success(`Content created as ${formData.status}!`);
        setIsAddModalOpen(false);
        setFormData({ title: "", code: "", contentType: "Article", status: "DRAFT", description: "" });
        fetchBlogs();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create content");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await API.put(`/blog/${id}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Content status updated to ${newStatus}`);
        fetchBlogs();
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const confirmDelete = (blog) => {
    setDeleteModal({
      isOpen: true,
      blogId: blog.id,
      blogTitle: blog.title,
    });
  };

  const handleExecuteDelete = async () => {
    if (!deleteModal.blogId) return;
    try {
      await API.delete(`/blog/${deleteModal.blogId}`);
      toast.success("Article deleted successfully");
      setDeleteModal({ isOpen: false, blogId: null, blogTitle: "" });
      fetchBlogs();
    } catch (err) {
      toast.error("Failed to delete article");
    }
  };

  const filteredBlogs = blogs.filter((b) => {
    const matchesSearch =
      b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.code?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
    const matchesType = typeFilter === "ALL" || b.contentType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Newspaper size={24} className="text-rose-600" />
            Content CMS & Article Publishing Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage articles, news, exam updates & content publishing workflow (Draft ➔ Review ➔ Live)
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-colors shadow-sm shrink-0"
        >
          <Plus size={18} />
          <span>Create Article</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              statusFilter === "ALL"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            All Status ({blogs.length})
          </button>

          {STATUS_OPTIONS.map((st) => {
            const count = blogs.filter((b) => b.status === st.value).length;
            return (
              <button
                key={st.value}
                onClick={() => setStatusFilter(st.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  statusFilter === st.value
                    ? "bg-rose-600 text-white shadow-sm"
                    : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {st.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium bg-slate-50 text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            {CONTENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <div className="relative flex-1 md:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search title, code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>
      </div>

      {/* Main Content Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-rose-600 mb-2" size={28} />
            <p className="text-xs text-slate-500">Loading CMS contents...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">No content matches the selected filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold">
                <tr>
                  <th className="px-5 py-3">Title & Category</th>
                  <th className="px-5 py-3">Code</th>
                  <th className="px-5 py-3">Author</th>
                  <th className="px-5 py-3">Publish Stage</th>
                  <th className="px-5 py-3">Created Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBlogs.map((blog) => {
                  const currentSt = STATUS_OPTIONS.find((s) => s.value === blog.status) || STATUS_OPTIONS[0];
                  return (
                    <tr key={blog.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-bold text-slate-800 flex items-center gap-2">
                          <Newspaper size={16} className="text-rose-600 shrink-0" />
                          <span>{blog.title}</span>
                        </div>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {blog.contentType || "Article"}
                        </span>
                      </td>

                      <td className="px-5 py-3 text-slate-500 font-mono text-xs">{blog.code}</td>

                      <td className="px-5 py-3 text-xs text-slate-600 font-medium">
                        {blog.authorName || "Editor"}
                      </td>

                      <td className="px-5 py-3">
                        <select
                          value={blog.status}
                          onChange={(e) => handleStatusChange(blog.id, e.target.value)}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg border focus:outline-none cursor-pointer ${currentSt.color}`}
                        >
                          {STATUS_OPTIONS.map((st) => (
                            <option key={st.value} value={st.value}>
                              {st.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-5 py-3 text-slate-400 text-xs">
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => confirmDelete(blog)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Content Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800">Create New CMS Content</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateBlog} className="space-y-4 text-sm">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Content Category *</label>
                <select
                  value={formData.contentType}
                  onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-rose-500"
                >
                  {CONTENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Article Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. RUHS Nursing Entrance Exam Result 2026 Out"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Slug / Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. ruhs-nursing-result-2026"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Initial Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-rose-500"
                >
                  <option value="DRAFT">Draft (Save for editing later)</option>
                  <option value="REVIEW">Submit for Admin Review</option>
                  <option value="PUBLISHED">Publish Live Immediately</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Content Body / Summary *</label>
                <textarea
                  rows="4"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Write full article description or news body..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-rose-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg"
                >
                  Save Content
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold text-slate-800">Confirm Deletion</h3>
            </div>
            <p className="text-slate-600 text-sm mb-6">
              Are you sure you want to delete <span className="font-semibold text-slate-900">"{deleteModal.blogTitle}"</span>?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ isOpen: false, blogId: null, blogTitle: "" })}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm"
              >
                Delete Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blogs;
