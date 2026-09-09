import React, { useState, useEffect } from "react";
import API from "../api/client";
import { toast } from "react-hot-toast";
import { Building2, Plus, Search, MapPin, Calendar, Award } from "lucide-react";

const Universities = () => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    type: "State",
    location: "",
    establishedYear: "",
  });

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const res = await API.get("/university");
      if (res.data.success) {
        setUniversities(res.data.data || []);
      }
    } catch (err) {
      toast.error("Failed to load universities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      return toast.error("University name is required");
    }

    try {
      const res = await API.post("/university", {
        ...formData,
        establishedYear: formData.establishedYear ? Number(formData.establishedYear) : null,
      });

      if (res.data.success) {
        toast.success("University added successfully!");
        setShowModal(false);
        setFormData({ name: "", type: "State", location: "", establishedYear: "" });
        fetchUniversities();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add university");
    }
  };

  const filteredUniversities = universities.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.location && u.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="text-blue-600" size={26} />
            Universities Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage affiliated universities (State, Central, Private, Deemed)
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Add University
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search size={18} className="text-slate-400" />
        <input
          type="text"
          placeholder="Search by university name or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* Universities Grid / List */}
      {loading ? (
        <div className="p-8 text-center text-slate-500 font-medium bg-white rounded-xl border border-slate-200">
          Loading universities...
        </div>
      ) : filteredUniversities.length === 0 ? (
        <div className="p-8 text-center text-slate-500 font-medium bg-white rounded-xl border border-slate-200">
          No universities found. Add your first university!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUniversities.map((univ) => (
            <div
              key={univ.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-slate-800 text-base leading-snug">
                  {univ.name}
                </h3>
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                  {univ.type || "State"}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                {univ.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400 shrink-0" />
                    <span>{univ.location}</span>
                  </div>
                )}
                {univ.establishedYear && (
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400 shrink-0" />
                    <span>Est. {univ.establishedYear}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add University Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-800">Add New University</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  University Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajasthan University of Health Sciences"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  University Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                >
                  <option value="State">State University</option>
                  <option value="Central">Central University</option>
                  <option value="Private">Private University</option>
                  <option value="Deemed">Deemed University</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Location (City, State)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jaipur, Rajasthan"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Established Year
                </label>
                <input
                  type="number"
                  placeholder="e.g. 2005"
                  value={formData.establishedYear}
                  onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
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
                  Save University
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Universities;
