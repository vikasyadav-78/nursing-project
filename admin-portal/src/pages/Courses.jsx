import React, { useState, useEffect } from "react";
import { Plus, Search, Pencil, Trash2, Loader2, BookOpen, AlertTriangle, X, Star } from "lucide-react";
import API from "../api/client";
import toast from "react-hot-toast";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editModal, setEditModal] = useState({ isOpen: false, course: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, courseId: null, courseName: "" });

  const initialForm = {
    name: "",
    code: "",
    duration: "",
    eligibility: "",
    isTrending: false,
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await API.get("/course");
      if (res.data?.success) {
        setCourses(res.data.data || []);
      }
    } catch (err) {
      console.error("Fetch courses error:", err);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/course", formData);
      if (res.data?.success) {
        toast.success("Course added successfully!");
        setIsAddModalOpen(false);
        setFormData(initialForm);
        fetchCourses();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add course");
    }
  };

  const handleOpenEditModal = (course) => {
    setEditModal({ isOpen: true, course });
    setFormData({
      name: course.name || "",
      code: course.code || "",
      duration: course.duration || "",
      eligibility: course.eligibility || "",
      isTrending: course.isTrending || false,
    });
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    if (!editModal.course?.id) return;
    try {
      const res = await API.put(`/course/${editModal.course.id}`, formData);
      if (res.data?.success) {
        toast.success("Course updated successfully!");
        setEditModal({ isOpen: false, course: null });
        setFormData(initialForm);
        fetchCourses();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update course");
    }
  };

  const confirmDelete = (course) => {
    setDeleteModal({
      isOpen: true,
      courseId: course.id,
      courseName: course.name,
    });
  };

  const handleExecuteDelete = async () => {
    if (!deleteModal.courseId) return;
    try {
      await API.delete(`/course/${deleteModal.courseId}`);
      toast.success("Course deleted successfully");
      setDeleteModal({ isOpen: false, courseId: null, courseName: "" });
      fetchCourses();
    } catch (err) {
      toast.error("Failed to delete course");
    }
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.code?.toLowerCase().includes(search.toLowerCase()) ||
      c.duration?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Courses Management</h1>
          <p className="text-xs text-slate-500 mt-1">Manage all available nursing & medical courses</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={() => {
              setFormData(initialForm);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus size={16} />
            <span>Add Course</span>
          </button>
        </div>
      </div>

      {/* Courses List Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200">
          <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
          <p className="text-xs text-slate-500">Loading courses...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
          No courses found. Click "Add Course" to create a new course.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-5 py-3">Course Name</th>
                  <th className="px-5 py-3">Code</th>
                  <th className="px-5 py-3">Duration</th>
                  <th className="px-5 py-3">Eligibility</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-800 flex items-center gap-3">
                      <BookOpen size={18} className="text-blue-600 shrink-0" />
                      <span>{course.name}</span>
                      {course.isTrending && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Star size={10} className="fill-amber-500 text-amber-500" />
                          Trending
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-500 font-mono text-xs">{course.code}</td>
                    <td className="px-5 py-3 text-slate-600 font-medium">{course.duration}</td>
                    <td className="px-5 py-3 text-slate-600">{course.eligibility || "-"}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          course.isActive !== false
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {course.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(course)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Course"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => confirmDelete(course)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Course"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Course Modal */}
      {(isAddModalOpen || editModal.isOpen) && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">
                {editModal.isOpen ? "Edit Course" : "Add New Course"}
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditModal({ isOpen: false, course: null });
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={editModal.isOpen ? handleUpdateCourse : handleCreateCourse} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Course Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B.Sc Nursing"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Course Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BSC-NURSING"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Duration *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4 Years"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Eligibility</label>
                <input
                  type="text"
                  placeholder="e.g. 10+2 with PCB (50%)"
                  value={formData.eligibility}
                  onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isTrending"
                  checked={formData.isTrending}
                  onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="isTrending" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Mark as Trending Course
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditModal({ isOpen: false, course: null });
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
                >
                  {editModal.isOpen ? "Save Changes" : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Delete Course</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <span className="font-semibold text-slate-700">{deleteModal.courseName}</span>?
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteModal({ isOpen: false, courseId: null, courseName: "" })}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteDelete}
                className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
