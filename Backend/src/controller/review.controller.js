import { prisma } from "../database/prisma.js";

// Helper to recalculate college rating
async function updateCollegeRating(collegeId) {
  try {
    const cId = String(collegeId);
    const approvedReviews = await prisma.review.findMany({
      where: {
        collegeId: cId,
        status: "approved",
      },
      select: { rating: true },
    });

    if (approvedReviews.length > 0) {
      const avg = approvedReviews.reduce((acc, curr) => acc + curr.rating, 0) / approvedReviews.length;
      await prisma.college.update({
        where: { id: cId },
        data: { rating: avg.toFixed(1) },
      });
    }
  } catch (err) {
    console.error("Error updating college rating:", err);
  }
}

export const getCollegeReviews = async (req, res) => {
  try {
    const { collegeId } = req.params;
    // Public API returns only approved reviews
    const reviews = await prisma.review.findMany({
      where: {
        collegeId: String(collegeId),
        status: "approved",
      },
    });

    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addReview = async (req, res) => {
  try {
    const { collegeId, userId, userName, rating, comment } = req.body;
    if (!collegeId || !rating) {
      return res.status(400).json({ success: false, message: "College ID and rating are required" });
    }

    await prisma.review.create({
      data: {
        collegeId: String(collegeId),
        userId: userId ? String(userId) : (req.user?.id ? String(req.user.id) : null),
        userName: userName || "Student",
        rating: Number(rating),
        comment,
        status: "pending", // Moderation Queue Flow
      },
    });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully! It will be published after moderation approval.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- FLOW 3: ADMIN MODERATION QUEUE CONTROLLERS ---

export const getModerationQueue = async (req, res) => {
  try {
    const { status = "pending" } = req.query;

    const reviews = await prisma.review.findMany({
      where: { status },
    });

    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveReview = async (req, res) => {
  try {
    const { id } = req.params;
    const revId = String(id);

    const existing = await prisma.review.findUnique({
      where: { id: revId },
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    await prisma.review.update({
      where: { id: revId },
      data: {
        status: "approved",
        moderatedAt: new Date(),
        moderatedBy: req.user?.id ? String(req.user.id) : "admin",
      },
    });

    // Auto recalculate college average rating
    await updateCollegeRating(existing.collegeId);

    res.json({ success: true, message: "Review approved and published!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectReview = async (req, res) => {
  try {
    const { id } = req.params;
    const revId = String(id);
    const { rejectionReason } = req.body;

    const existing = await prisma.review.findUnique({
      where: { id: revId },
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    await prisma.review.update({
      where: { id: revId },
      data: {
        status: "rejected",
        rejectionReason: rejectionReason || "Violates community guidelines",
        moderatedAt: new Date(),
        moderatedBy: req.user?.id ? String(req.user.id) : "admin",
      },
    });

    res.json({ success: true, message: "Review rejected" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

