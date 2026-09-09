import { db } from "../database/db.js";
import { reviewsTable } from "../models/review.schema.js";
import { collegesTable } from "../models/college.schema.js";
import { eq, and, sql } from "drizzle-orm";

// Helper to recalculate college rating
async function updateCollegeRating(collegeId) {
  try {
    const approvedReviews = await db
      .select({ rating: reviewsTable.rating })
      .from(reviewsTable)
      .where(and(eq(reviewsTable.collegeId, collegeId), eq(reviewsTable.status, "approved")));

    if (approvedReviews.length > 0) {
      const avg = approvedReviews.reduce((acc, curr) => acc + curr.rating, 0) / approvedReviews.length;
      await db
        .update(collegesTable)
        .set({ rating: avg.toFixed(1) })
        .where(eq(collegesTable.id, collegeId));
    }
  } catch (err) {
    console.error("Error updating college rating:", err);
  }
}

export const getCollegeReviews = async (req, res) => {
  try {
    const { collegeId } = req.params;
    // Public API returns only approved reviews
    const reviews = await db
      .select()
      .from(reviewsTable)
      .where(and(eq(reviewsTable.collegeId, collegeId), eq(reviewsTable.status, "approved")));

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

    await db.insert(reviewsTable).values({
      collegeId,
      userId: userId || req.user?.id || null,
      userName: userName || "Student",
      rating: Number(rating),
      comment,
      status: "pending", // Moderation Queue Flow
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

    const reviews = await db
      .select({
        review: reviewsTable,
        collegeName: collegesTable.name,
      })
      .from(reviewsTable)
      .leftJoin(collegesTable, eq(reviewsTable.collegeId, collegesTable.id))
      .where(eq(reviewsTable.status, status));

    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveReview = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.select().from(reviewsTable).where(eq(reviewsTable.id, id));
    if (!existing) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    await db
      .update(reviewsTable)
      .set({
        status: "approved",
        moderatedAt: new Date(),
        moderatedBy: req.user?.id || "admin",
      })
      .where(eq(reviewsTable.id, id));

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
    const { rejectionReason } = req.body;

    const [existing] = await db.select().from(reviewsTable).where(eq(reviewsTable.id, id));
    if (!existing) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    await db
      .update(reviewsTable)
      .set({
        status: "rejected",
        rejectionReason: rejectionReason || "Violates community guidelines",
        moderatedAt: new Date(),
        moderatedBy: req.user?.id || "admin",
      })
      .where(eq(reviewsTable.id, id));

    res.json({ success: true, message: "Review rejected" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
