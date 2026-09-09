import React, { useState, useEffect } from "react";
import { Plus, Search, Pencil, Trash2, Loader2, FileCheck, AlertTriangle, X } from "lucide-react";
import API from "../api/client";
import toast from "react-hot-toast";

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [categories, setCategories] = useState(["Medical", "Nursing", "Engineering", "Management"]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, examId: null, examName: "" });
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    category: "Medical",
    examLevel: "National",
    description: "",
    officialWebsite: "",
    isTrending: false,
  });

  useEffect(() => {
    fetchExams();
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    try {
      const res = await API.get("/stream");
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        const streamNames = res.data.data.map((s) => s.name);
        setCategories(streamNames);
        setFormData((prev) => ({ ...prev, category: streamNames[0] || "Medical" }));
      }
    } catch (err) {
      console.error("Failed to load streams for category dropdown", err);
    }
  };

  const fetchExams = async () => {
    try {
      const res = await API.get("/exams");
      if (res.data?.success) {
        setExams(res.data.data || []);
      }
    } catch (err) {
      toast.error("Failed to fetch entrance exams");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/exams", formData);
      if (res.data?.success) {
        toast.success("Exam added successfully");
        setIsAddModalOpen(false);
        setFormData({
          name: "",
          code: "",
          category: "Medical",
          examLevel: "National",
          description: "",
          officialWebsite: "",
          isTrending: false,
        });
        fetchExams();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add exam");
    }
  };

  const confirmDelete = (exam) => {
    setDeleteModal({
      isOpen: true,
      examId: exam.id,
      examName: exam.name,
    });
  };

  const handleExecuteDelete = async () => {
    if (!deleteModal.examId) return;
    try {
      await API.delete(`/exams/${deleteModal.examId}`);
      toast.success("Entrance exam deleted successfully");
      setDeleteModal({ isOpen: false, examId: null, examName: "" });
      fetchExams();
    } catch (err) {
      toast.error("Failed to delete entrance exam");
    }
  };

  const filteredExams = exams.filter(
    (e) =>
      e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Entrance Exams & Alerts</h1>
          <p className="text-xs text-slate-500 mt-1">Manage national, state & university entrance exams</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search exams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <Plus size={16} />
            <span>Add Exam</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-amber-600 mb-2" size={28} />
            <p className="text-xs text-slate-500">Loading entrance exam records...</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">No entrance exams registered yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-5 py-3">Exam Name</th>
                  <th className="px-5 py-3">Code</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Level</th>
                  <th className="px-5 py-3">Trending</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-800 flex items-center gap-3">
                      <FileCheck size={18} className="text-amber-600" />
                      <span>{exam.name}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 font-mono text-xs">{exam.code}</td>
                    <td className="px-5 py-3 text-slate-600">{exam.category || "General"}</td>
                    <td className="px-5 py-3">
                      <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded text-xs font-medium">
                        {exam.examLevel || "National"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${exam.isTrending ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                        {exam.isTrending ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right space-x-2">
                      <button onClick={() => confirmDelete(exam)} className="p-1.5 text-slate-500 hover:text-red-600 rounded hover:bg-slate-100">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Exam Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800">Add Entrance Exam</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateExam} className="space-y-4 text-sm">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Exam Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. NEET UG 2026"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Exam Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. NEET-2026"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-amber-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Official Website</label>
                <input
                  type="url"
                  value={formData.officialWebsite}
                  onChange={(e) => setFormData({ ...formData, officialWebsite: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isTrending"
                  checked={formData.isTrending}
                  onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="isTrending" className="font-medium text-slate-700 text-xs">
                  Mark as Trending Exam (Show on Homepage)
                </label>
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
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg"
                >
                  Save Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold text-slate-800">Confirm Deletion</h3>
            </div>
            <p className="text-slate-600 text-sm mb-6">
              Are you sure you want to delete <span className="font-semibold text-slate-900">"{deleteModal.examName}"</span>?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ isOpen: false, examId: null, examName: "" })}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm"
              >
                Delete Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exams;
