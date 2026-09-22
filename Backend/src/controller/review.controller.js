import { prisma } from "../database/prisma.js";

// Public API: Get top 15 published agency reviews
export const getPublicReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        status: "approved",
      },
      orderBy: { createdAt: "desc" },
      take: 15,
    });

    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Legacy/Compatibility API
export const getCollegeReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        status: "approved",
      },
      orderBy: { createdAt: "desc" },
      take: 15,
    });

    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add Agency Student Review
export const addReview = async (req, res) => {
  try {
    const { collegeId, userId, userName, rating, comment } = req.body;
    if (!rating) {
      return res.status(400).json({ success: false, message: "Rating is required" });
    }

    await prisma.review.create({
      data: {
        collegeId: String(collegeId || "agency"),
        userId: userId ? String(userId) : (req.user?.id ? String(req.user.id) : null),
        userName: userName || "Student",
        rating: Number(rating),
        comment,
        status: "pending", // Moderation Queue Flow
      },
    });

    res.status(201).json({
      success: true,
      message: "Agency review submitted successfully! It will be published after admin approval.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- ADMIN MODERATION QUEUE CONTROLLERS ---

export const getModerationQueue = async (req, res) => {
  try {
    const { status = "pending" } = req.query;

    const reviews = await prisma.review.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
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

    // Check existing approved agency reviews count to enforce max 15 limit
    const currentApproved = await prisma.review.findMany({
      where: {
        status: "approved",
      },
      orderBy: { createdAt: "asc" }, // Oldest first
    });

    // If count >= 15, remove oldest approved review(s) to maintain max 15 limit
    if (currentApproved.length >= 15) {
      const toDeleteCount = currentApproved.length - 14; // Make room for 1 new review
      const toDeleteIds = currentApproved.slice(0, toDeleteCount).map((r) => r.id);

      await prisma.review.deleteMany({
        where: {
          id: { in: toDeleteIds },
        },
      });
    }

    await prisma.review.update({
      where: { id: revId },
      data: {
        status: "approved",
        moderatedAt: new Date(),
        moderatedBy: req.user?.id ? String(req.user.id) : "admin",
      },
    });

    res.json({ success: true, message: "Agency review approved and published! (Max 15 limit enforced)" });
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

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const revId = String(id);

    const existing = await prisma.review.findUnique({
      where: { id: revId },
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    await prisma.review.delete({
      where: { id: revId },
    });

    res.json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
