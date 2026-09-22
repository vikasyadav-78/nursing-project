import React, { useState, useEffect } from "react";
import API from "../api/client";
import { toast } from "react-hot-toast";
import { Star, Plus, User, CheckCircle, XCircle, ShieldAlert, Trash2, Building2, AlertTriangle } from "lucide-react";

const Reviews = () => {
  const [activeTab, setActiveTab] = useState("moderation"); // 'moderation' or 'approved'
  const [reviews, setReviews] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, reviewId: null, reviewName: "" });

  const [formData, setFormData] = useState({
    userName: "",
    rating: 5,
    comment: "",
  });

  useEffect(() => {
    fetchPendingReviews();
    fetchApprovedReviews();
  }, []);

  const fetchPendingReviews = async () => {
    try {
      setLoading(true);
      const res = await API.get("/review/moderation-queue?status=pending");
      setPendingReviews(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedReviews = async () => {
    try {
      setLoading(true);
      const res = await API.get("/review/public");
      setReviews(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load published agency reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await API.put(`/review/${id}/approve`);
      if (res.data.success) {
        toast.success("Agency review approved & published!");
        fetchPendingReviews();
        fetchApprovedReviews();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve review");
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter rejection reason (optional):", "Violates community guidelines");
    if (reason === null) return;

    try {
      const res = await API.put(`/review/${id}/reject`, { rejectionReason: reason });
      if (res.data.success) {
        toast.success("Review rejected");
        fetchPendingReviews();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject review");
    }
  };

  const confirmDeleteReview = async () => {
    if (!deleteModal.reviewId) return;
    try {
      const res = await API.delete(`/review/${deleteModal.reviewId}`);
      if (res.data.success) {
        toast.success("Review deleted successfully!");
        setDeleteModal({ isOpen: false, reviewId: null, reviewName: "" });
        fetchApprovedReviews();
        fetchPendingReviews();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete review");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/review", {
        userName: formData.userName || "Student",
        rating: Number(formData.rating),
        comment: formData.comment,
      });

      if (res.data.success) {
        toast.success("Agency review submitted for moderation!");
        setShowModal(false);
        setFormData({
          userName: "",
          rating: 5,
          comment: "",
        });
        fetchPendingReviews();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add review");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Star className="text-amber-500 fill-amber-500 shrink-0" size={24} />
            <span>Agency Admission Reviews & Moderation</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Student admission feedback, agency ratings & review moderation queue
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm w-full sm:w-auto shrink-0"
        >
          <Plus size={18} />
          Add Student Review
        </button>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-2 sm:gap-4 border-b border-slate-200 overflow-x-auto no-scrollbar pb-0.5">
        <button
          onClick={() => setActiveTab("moderation")}
          className={`pb-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "moderation"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <ShieldAlert size={16} />
          <span>Moderation Queue</span>
          {pendingReviews.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-700">
              {pendingReviews.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("approved")}
          className={`pb-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "approved"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Star size={16} />
          <span>Published Agency Reviews</span>
        </button>
      </div>

      {/* MODERATION QUEUE TAB */}
      {activeTab === "moderation" && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-8 text-center text-slate-500 font-medium bg-white rounded-xl border border-slate-200">
              Loading queue...
            </div>
          ) : pendingReviews.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
              <CheckCircle size={40} className="mx-auto mb-2 text-emerald-500" />
              <p className="text-base font-semibold text-slate-700">Moderation Queue is Empty</p>
              <p className="text-xs text-slate-400 mt-1">All student agency reviews have been moderated!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingReviews.map((item) => {
                const rev = item.review || item;

                return (
                  <div
                    key={rev.id || item.id}
                    className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1">
                          <Building2 size={12} /> Agency Service Review
                        </span>
                        <div className="flex items-center gap-1 text-amber-500 text-xs font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <Star size={12} className="fill-amber-500" />
                          <span>{rev.rating ?? 0} / 5</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <User size={16} className="text-slate-400" />
                        <span>{rev.userName || "Student"}</span>
                      </div>

                      <p className="text-xs text-slate-700 italic bg-slate-50 p-3 rounded-lg border border-slate-200">
                        "{rev.comment}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleApprove(rev.id)}
                        className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle size={14} />
                        Approve & Publish
                      </button>
                      <button
                        onClick={() => handleReject(rev.id)}
                        className="flex-1 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-semibold hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <XCircle size={14} />
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PUBLISHED REVIEWS TAB */}
      {activeTab === "approved" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
            <h2 className="text-sm font-bold text-slate-800">
              Published Agency Student Reviews
            </h2>
            <div className="text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shrink-0">
              Total Published: <strong className="text-blue-600">{reviews.length}</strong> / 15 (Max Limit)
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500 font-medium bg-white rounded-xl border border-slate-200">
              Loading published agency reviews...
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-medium bg-white rounded-xl border border-slate-200">
              No approved agency reviews published yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <User size={16} className="text-slate-400" />
                        <span>{rev.userName || "Student"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Star size={12} className="fill-amber-500" />
                        <span>{rev.rating} / 5</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                      "{rev.comment}"
                    </p>
                  </div>

                  <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setDeleteModal({ isOpen: true, reviewId: rev.id, reviewName: rev.userName })}
                      className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                      title="Delete Review"
                    >
                      <Trash2 size={14} />
                      <span>Delete Review</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Review Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-800">Add Agency Student Review</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.userName}
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rating (1 to 5) *
                </label>
                <select
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-600 bg-white"
                >
                  <option value="5">⭐⭐⭐⭐⭐ (5.0 - Excellent Service)</option>
                  <option value="4">⭐⭐⭐⭐ (4.0 - Very Good)</option>
                  <option value="3">⭐⭐⭐ (3.0 - Good)</option>
                  <option value="2">⭐⭐ (2.0 - Average)</option>
                  <option value="1">⭐ (1.0 - Poor)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Review Comment *
                </label>
                <textarea
                  required
                  rows="3"
                  placeholder="Write student feedback about admission guidance, support, and agency service..."
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
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
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal Popup */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle size={28} />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-800">Delete Published Review?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete the published review submitted by{" "}
                <span className="font-semibold text-slate-700">"{deleteModal.reviewName || "Student"}"</span>? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, reviewId: null, reviewName: "" })}
                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteReview}
                className="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition-colors shadow-sm"
              >
                Yes, Delete Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
