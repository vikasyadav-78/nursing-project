import React, { useState, useEffect } from "react";
import {
  UserPlus,
  Search,
  Phone,
  Mail,
  MapPin,
  Loader2,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Calendar,
  History,
  FileText,
} from "lucide-react";
import API from "../api/client";
import toast from "react-hot-toast";

const STATUS_STAGES = [
  { value: "NEW", label: "New Lead", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "CONTACTED", label: "Contacted", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "QUALIFIED", label: "Qualified", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { value: "COUNSELLING", label: "Counselling", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { value: "APPLICATION_STARTED", label: "App Started", color: "bg-teal-100 text-teal-700 border-teal-200" },
  { value: "APPLICATION_SUBMITTED", label: "App Submitted", color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  { value: "ADMISSION_CONFIRMED", label: "Admission Confirmed", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  { value: "LOST", label: "Lost", color: "bg-rose-100 text-rose-700 border-rose-200" },
  { value: "CLOSED", label: "Closed", color: "bg-slate-100 text-slate-700 border-slate-200" },
];

const COUNSELLORS_LIST = [
  { id: "c1", name: "Ananya Sharma (Senior Counselor)" },
  { id: "c2", name: "Rohan Verma (Admissions Team)" },
  { id: "c3", name: "Priya Singh (Nursing Expert)" },
];

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, leadId: null, leadName: "" });
  const [followUpModal, setFollowUpModal] = useState({ isOpen: false, lead: null });
  const [historyModal, setHistoryModal] = useState({ isOpen: false, lead: null });

  const [followUpData, setFollowUpData] = useState({ followUpDate: "", notes: "" });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await API.get("/leads");
      if (res.data?.success) {
        setLeads(res.data.data || []);
      }
    } catch (err) {
      toast.error("Failed to load counselling leads");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      const res = await API.put(`/leads/${leadId}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Status updated to ${newStatus}`);
        fetchLeads();
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleCounsellorAssign = async (leadId, counsellorName) => {
    if (!counsellorName) return;
    try {
      const counsellor = COUNSELLORS_LIST.find((c) => c.name === counsellorName);
      const res = await API.put(`/leads/${leadId}/assign`, {
        counsellorId: counsellor?.id || "c1",
        counsellorName,
      });
      if (res.data.success) {
        toast.success(`Assigned to ${counsellorName}`);
        fetchLeads();
      }
    } catch (err) {
      toast.error("Failed to assign counsellor");
    }
  };

  const handleSaveFollowUp = async (e) => {
    e.preventDefault();
    if (!followUpModal.lead) return;

    try {
      const res = await API.post(`/leads/${followUpModal.lead.id}/follow-up`, followUpData);
      if (res.data.success) {
        toast.success("Follow-up note & date saved!");
        setFollowUpModal({ isOpen: false, lead: null });
        setFollowUpData({ followUpDate: "", notes: "" });
        fetchLeads();
      }
    } catch (err) {
      toast.error("Failed to save follow-up");
    }
  };

  const confirmDelete = (lead) => {
    setDeleteModal({
      isOpen: true,
      leadId: lead.id,
      leadName: lead.name || lead.phone,
    });
  };

  const handleExecuteDelete = async () => {
    if (!deleteModal.leadId) return;
    try {
      await API.delete(`/leads/${deleteModal.leadId}`);
      toast.success("Lead enquiry deleted successfully");
      setDeleteModal({ isOpen: false, leadId: null, leadName: "" });
      fetchLeads();
    } catch (err) {
      toast.error("Failed to delete lead enquiry");
    }
  };

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.phone?.includes(search) ||
      l.city?.toLowerCase().includes(search.toLowerCase()) ||
      l.counsellorName?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <UserPlus size={24} className="text-blue-600" />
            Lead Lifecycle & Counsellor CRM
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track student enquiry lifecycle stages, counsellor assignments & follow-up activities
          </p>
        </div>

        <div className="relative flex-1 sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search name, phone, city, counsellor..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-600"
          />
        </div>
      </div>

      {/* Stage Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        <button
          onClick={() => {
            setStatusFilter("ALL");
            setCurrentPage(1);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
            statusFilter === "ALL"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          All Stages ({leads.length})
        </button>

        {STATUS_STAGES.map((st) => {
          const count = leads.filter((l) => l.status === st.value).length;
          return (
            <button
              key={st.value}
              onClick={() => {
                setStatusFilter(st.value);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === st.value
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {st.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-blue-600 mb-2" size={28} />
            <p className="text-xs text-slate-500">Loading lead database...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">No student leads found for selected filters.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold">
                  <tr>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Target Info</th>
                    <th className="px-4 py-3">Lifecycle Stage</th>
                    <th className="px-4 py-3">Assigned Counsellor</th>
                    <th className="px-4 py-3">Follow-up Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentLeads.map((lead) => {
                    const currentStage = STATUS_STAGES.find((s) => s.value === lead.status) || STATUS_STAGES[0];
                    return (
                      <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-800 flex items-center gap-2">
                            <UserPlus size={16} className="text-blue-600 shrink-0" />
                            <span>{lead.name || "Anonymous"}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Created: {new Date(lead.createdAt).toLocaleDateString()}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex flex-col text-xs gap-0.5">
                            <span className="flex items-center gap-1 text-slate-800 font-semibold">
                              <Phone size={12} /> {lead.phone}
                            </span>
                            {lead.email && (
                              <span className="flex items-center gap-1 text-slate-500">
                                <Mail size={12} /> {lead.email}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3 text-xs">
                          <div className="font-semibold text-slate-700">{lead.course || lead.stream || "General Enquiry"}</div>
                          <div className="text-slate-500 text-[11px] flex items-center gap-1">
                            <MapPin size={11} /> {lead.city || lead.state ? `${lead.city || ""}, ${lead.state || ""}` : "N/A"}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg border focus:outline-none cursor-pointer ${currentStage.color}`}
                          >
                            {STATUS_STAGES.map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="px-4 py-3">
                          <select
                            value={lead.counsellorName || ""}
                            onChange={(e) => handleCounsellorAssign(lead.id, e.target.value)}
                            className="px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 font-medium focus:outline-none focus:border-blue-600"
                          >
                            <option value="">Unassigned</option>
                            {COUNSELLORS_LIST.map((c) => (
                              <option key={c.id} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="px-4 py-3 text-xs">
                          {lead.followUpDate ? (
                            <div className="flex flex-col">
                              <span className="font-semibold text-amber-700 flex items-center gap-1">
                                <Calendar size={12} /> {new Date(lead.followUpDate).toLocaleDateString()}
                              </span>
                              {lead.followUpNotes && (
                                <span className="text-[11px] text-slate-500 line-clamp-1">{lead.followUpNotes}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">No follow-up set</span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              title="Schedule Follow-up"
                              onClick={() => {
                                setFollowUpModal({ isOpen: true, lead });
                                setFollowUpData({
                                  followUpDate: lead.followUpDate ? lead.followUpDate.split("T")[0] : "",
                                  notes: lead.followUpNotes || "",
                                });
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Calendar size={16} />
                            </button>

                            <button
                              title="View Activity History"
                              onClick={() => setHistoryModal({ isOpen: true, lead })}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"
                            >
                              <History size={16} />
                            </button>

                            <button
                              title="Delete Lead"
                              onClick={() => confirmDelete(lead)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <p className="text-xs text-slate-500 font-medium">
                Showing <span className="font-bold text-slate-700">{startIndex + 1}</span> to{" "}
                <span className="font-bold text-slate-700">{Math.min(startIndex + itemsPerPage, filteredLeads.length)}</span> of{" "}
                <span className="font-bold text-slate-700">{filteredLeads.length}</span> leads
              </p>

              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg ${
                        currentPage === p ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-600"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Follow-up Modal */}
      {followUpModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Schedule Follow-up</h3>
            <form onSubmit={handleSaveFollowUp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Follow-up Date *</label>
                <input
                  type="date"
                  required
                  value={followUpData.followUpDate}
                  onChange={(e) => setFollowUpData({ ...followUpData, followUpDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Counsellor Call / Activity Notes</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Student interested in B.Sc Nursing. Parent called for fee structure..."
                  value={followUpData.notes}
                  onChange={(e) => setFollowUpData({ ...followUpData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFollowUpModal({ isOpen: false, lead: null })}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg text-sm hover:bg-blue-700">
                  Save Follow-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activity History Modal */}
      {historyModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[80vh] flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <History size={20} className="text-indigo-600" />
              Activity & Lifecycle Log ({historyModal.lead?.name || historyModal.lead?.phone})
            </h3>

            <div className="overflow-y-auto space-y-3 pr-2 flex-1">
              {Array.isArray(historyModal.lead?.activityHistory) && historyModal.lead.activityHistory.length > 0 ? (
                historyModal.lead.activityHistory.map((act, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-700">
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase tracking-wider text-[10px]">
                        {act.action}
                      </span>
                      <span className="text-slate-400 font-normal">{new Date(act.timestamp).toLocaleString()}</span>
                    </div>
                    {act.from && act.to && (
                      <p className="text-slate-600 font-medium">
                        Stage changed: <span className="line-through text-slate-400">{act.from}</span> ➔{" "}
                        <span className="text-emerald-600 font-bold">{act.to}</span>
                      </p>
                    )}
                    {act.notes && <p className="text-slate-700 italic">"{act.notes}"</p>}
                    {act.message && <p className="text-slate-600">{act.message}</p>}
                    {act.counsellorName && <p className="text-indigo-600 font-semibold">Assigned to: {act.counsellorName}</p>}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No activity logs recorded yet.</p>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setHistoryModal({ isOpen: false, lead: null })}
                className="px-4 py-2 bg-slate-800 text-white font-medium rounded-lg text-sm"
              >
                Close Log
              </button>
            </div>
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
              Are you sure you want to delete lead enquiry from <span className="font-semibold text-slate-900">"{deleteModal.leadName}"</span>?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ isOpen: false, leadId: null, leadName: "" })}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm"
              >
                Delete Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
