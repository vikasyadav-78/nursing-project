import React, { useState, useEffect } from "react";
import { Plus, Search, Trash2, Loader2, Layers, AlertTriangle, X } from "lucide-react";
import API from "../api/client";
import toast from "react-hot-toast";

const Streams = () => {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, streamId: null, streamName: "" });

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
  });

  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    try {
      const res = await API.get("/stream");
      if (res.data?.success) {
        setStreams(res.data.data || []);
      }
    } catch (err) {
      toast.error("Failed to load streams");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStream = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/stream", formData);
      if (res.data?.success) {
        toast.success("Stream added successfully");
        setIsAddModalOpen(false);
        setFormData({ name: "", code: "", description: "" });
        fetchStreams();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add stream");
    }
  };

  const confirmDelete = (stream) => {
    setDeleteModal({
      isOpen: true,
      streamId: stream.id,
      streamName: stream.name,
    });
  };

  const handleExecuteDelete = async () => {
    if (!deleteModal.streamId) return;
    try {
      await API.delete(`/stream/${deleteModal.streamId}`);
      toast.success("Stream deleted successfully");
      setDeleteModal({ isOpen: false, streamId: null, streamName: "" });
      fetchStreams();
    } catch (err) {
      toast.error("Failed to delete stream");
    }
  };

  const filteredStreams = streams.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Educational Streams & Disciplines</h1>
          <p className="text-xs text-slate-500 mt-1">Manage streams like Nursing, Medical, Engineering, Management</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search streams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <Plus size={16} />
            <span>Add Stream</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-cyan-600 mb-2" size={28} />
            <p className="text-xs text-slate-500">Loading educational streams...</p>
          </div>
        ) : filteredStreams.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">No streams added yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-5 py-3">Stream Name</th>
                  <th className="px-5 py-3">Code</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStreams.map((stream) => (
                  <tr key={stream.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-800 flex items-center gap-3">
                      <Layers size={18} className="text-cyan-600" />
                      <span>{stream.name}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 font-mono text-xs">{stream.code}</td>
                    <td className="px-5 py-3 text-slate-600 text-xs">{stream.description || "N/A"}</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => confirmDelete(stream)} className="p-1.5 text-slate-500 hover:text-red-600 rounded hover:bg-slate-100">
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

      {/* Add Stream Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800">Add Educational Stream</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateStream} className="space-y-4 text-sm">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Stream Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Nursing, Medical, Pharmacy"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Stream Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. NURS, MED, PHARM"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short description..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-cyan-500"
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
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg"
                >
                  Save Stream
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
              Are you sure you want to delete stream <span className="font-semibold text-slate-900">"{deleteModal.streamName}"</span>?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ isOpen: false, streamId: null, streamName: "" })}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm"
              >
                Delete Stream
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Streams;
