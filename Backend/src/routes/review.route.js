import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  getPublicReviews,
  getCollegeReviews,
  addReview,
  getModerationQueue,
  approveReview,
  rejectReview,
  deleteReview,
} from "../controller/review.controller.js";

const router = express.Router();

router.get("/public", getPublicReviews);
router.get("/college/:collegeId", getCollegeReviews);
router.post("/", addReview);

// Moderation Queue & Admin Actions
router.get("/moderation-queue", verifyToken, getModerationQueue);
router.put("/:id/approve", verifyToken, approveReview);
router.put("/:id/reject", verifyToken, rejectReview);
router.delete("/:id", verifyToken, deleteReview);

export default router;
