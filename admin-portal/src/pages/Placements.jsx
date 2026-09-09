import React, { useState, useEffect } from "react";
import API from "../api/client";
import { toast } from "react-hot-toast";
import { TrendingUp, Plus, GraduationCap, DollarSign, Users } from "lucide-react";

const Placements = () => {
  const [colleges, setColleges] = useState([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState("");
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    collegeId: "",
    year: new Date().getFullYear(),
    highestPackage: "",
    averagePackage: "",
    topRecruitersStr: "",
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
        fetchPlacements(list[0].id);
      }
    } catch (err) {
      toast.error("Failed to load colleges");
    }
  };

  const fetchPlacements = async (collegeId) => {
    if (!collegeId) return;
    try {
      setLoading(true);
      const res = await API.get(`/placement/college/${collegeId}`);
      setPlacements(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load placement records");
    } finally {
      setLoading(false);
    }
  };

  const handleCollegeChange = (e) => {
    const id = e.target.value;
    setSelectedCollegeId(id);
    fetchPlacements(id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.collegeId) return toast.error("Please select a college");

    try {
      const recruiters = formData.topRecruitersStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await API.post("/placement", {
        collegeId: formData.collegeId,
        year: Number(formData.year),
        highestPackage: formData.highestPackage,
        averagePackage: formData.averagePackage,
        topRecruiters: recruiters,
      });

      if (res.data.success) {
        toast.success("Placement record added!");
        setShowModal(false);
        setFormData({
          collegeId: selectedCollegeId,
          year: new Date().getFullYear(),
          highestPackage: "",
          averagePackage: "",
          topRecruitersStr: "",
        });
        fetchPlacements(selectedCollegeId);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add placement record");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="text-blue-600" size={26} />
            Placements & Recruiters
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage college placement statistics, packages, and top healthcare recruiters
          </p>
        </div>
        <button
          onClick={() => {
            setFormData((prev) => ({ ...prev, collegeId: selectedCollegeId }));
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Add Placement Stats
        </button>
      </div>

      {/* College Selector Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
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

      {/* Placements Cards */}
      {loading ? (
        <div className="p-8 text-center text-slate-500 font-medium bg-white rounded-xl border border-slate-200">
          Loading placements...
        </div>
      ) : placements.length === 0 ? (
        <div className="p-8 text-center text-slate-500 font-medium bg-white rounded-xl border border-slate-200">
          No placement records for this college yet. Click "Add Placement Stats" above!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {placements.map((p) => (
            <div
              key={p.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-sm font-bold text-slate-800">
                  Year {p.year}
                </span>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active Stats
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="text-slate-400 font-medium">Highest Package</div>
                  <div className="text-slate-800 font-bold text-sm mt-0.5">
                    {p.highestPackage || "N/A"}
                  </div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="text-slate-400 font-medium">Average Package</div>
                  <div className="text-slate-800 font-bold text-sm mt-0.5">
                    {p.averagePackage || "N/A"}
                  </div>
                </div>
              </div>

              {p.topRecruiters && p.topRecruiters.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Users size={14} className="text-slate-400" />
                    Top Recruiters:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {p.topRecruiters.map((r, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-xs bg-slate-100 text-slate-700 rounded border border-slate-200"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
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
            <h2 className="text-xl font-bold text-slate-800">Add Placement Stats</h2>
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
                  Placement Year *
                </label>
                <input
                  type="number"
                  required
                  placeholder="2025"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Highest Package (e.g. 8.5 LPA)
                </label>
                <input
                  type="text"
                  placeholder="8.5 LPA"
                  value={formData.highestPackage}
                  onChange={(e) => setFormData({ ...formData, highestPackage: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Average Package (e.g. 4.2 LPA)
                </label>
                <input
                  type="text"
                  placeholder="4.2 LPA"
                  value={formData.averagePackage}
                  onChange={(e) => setFormData({ ...formData, averagePackage: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Top Recruiters (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Fortis Healthcare, Apollo Hospitals, Max Healthcare"
                  value={formData.topRecruitersStr}
                  onChange={(e) => setFormData({ ...formData, topRecruitersStr: e.target.value })}
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
                  Save Stats
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Placements;
