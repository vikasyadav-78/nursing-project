import React, { useState, useEffect } from "react";
import API from "../api/client";
import { toast } from "react-hot-toast";
import { Award, Plus, GraduationCap, FileText } from "lucide-react";

const Scholarships = () => {
  const [colleges, setColleges] = useState([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState("");
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    collegeId: "",
    name: "",
    amount: "",
    eligibility: "",
  });

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      const res = await API.get("/college");
      const list = res.data.data || [];
      setColleges(list);
      if (list.length > 0) {
        setSelectedCollegeId(list[0].id);
        fetchScholarships(list[0].id);
      }
    } catch (err) {
      toast.error("Failed to load colleges");
    }
  };

  const fetchScholarships = async (collegeId) => {
    if (!collegeId) return;
    try {
      setLoading(true);
      const res = await API.get(`/scholarship/college/${collegeId}`);
      setScholarships(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load scholarships");
    } finally {
      setLoading(false);
    }
  };

  const handleCollegeChange = (e) => {
    const id = e.target.value;
    setSelectedCollegeId(id);
    fetchScholarships(id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.collegeId) return toast.error("Please select a college");
    if (!formData.name.trim()) return toast.error("Scholarship name is required");

    try {
      const res = await API.post("/scholarship", {
        collegeId: formData.collegeId,
        name: formData.name,
        amount: formData.amount,
        eligibility: formData.eligibility,
      });

      if (res.data.success) {
        toast.success("Scholarship scheme added!");
        setShowModal(false);
        setFormData({
          collegeId: selectedCollegeId,
          name: "",
          amount: "",
          eligibility: "",
        });
        fetchScholarships(selectedCollegeId);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add scholarship");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Award className="text-purple-600 shrink-0" size={24} />
            <span>Scholarships & Financial Aid</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage college-specific scholarships, eligibility criteria, and financial aid packages
          </p>
        </div>
        <button
          onClick={() => {
            setFormData((prev) => ({ ...prev, collegeId: selectedCollegeId }));
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm w-full sm:w-auto shrink-0"
        >
          <Plus size={18} />
          Add Scholarship
        </button>
      </div>

      {/* College Selector Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
          Select College:
        </label>
        <select
          value={selectedCollegeId}
          onChange={handleCollegeChange}
          className="w-full max-w-md px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-600 bg-white"
        >
          {colleges.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.city || c.state})
            </option>
          ))}
        </select>
      </div>

      {/* Scholarships Cards */}
      {loading ? (
        <div className="p-8 text-center text-slate-500 font-medium bg-white rounded-xl border border-slate-200">
          Loading scholarships...
        </div>
      ) : scholarships.length === 0 ? (
        <div className="p-8 text-center text-slate-500 font-medium bg-white rounded-xl border border-slate-200">
          No scholarships added for this college yet. Click "Add Scholarship" above!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scholarships.map((sch) => (
            <div
              key={sch.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-slate-800 text-base leading-snug">
                  {sch.name}
                </h3>
                {sch.amount && (
                  <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                    {sch.amount}
                  </span>
                )}
              </div>

              {sch.eligibility && (
                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
                  <div className="font-semibold text-slate-700">Eligibility Criteria:</div>
                  <p>{sch.eligibility}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-800">Add Scholarship Scheme</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  College *
                </label>
                <select
                  value={formData.collegeId}
                  onChange={(e) => setFormData({ ...formData, collegeId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-600 bg-white"
                >
                  {colleges.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Scholarship Scheme Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Merit-Cum-Means Scholarship"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount / Fee Waiver (e.g. 50% Tuition Fee Waiver or ₹25,000 / Year)
                </label>
                <input
                  type="text"
                  placeholder="50% Tuition Fee Waiver"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Eligibility Criteria
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Min 85% marks in 10+2 PCB or Annual family income under 2.5 Lakhs"
                  value={formData.eligibility}
                  onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Save Scheme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scholarships;
