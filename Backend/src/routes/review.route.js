import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  getCollegeReviews,
  addReview,
  getModerationQueue,
  approveReview,
  rejectReview,
} from "../controller/review.controller.js";

const router = express.Router();

router.get("/college/:collegeId", getCollegeReviews);
router.post("/", addReview);

// Moderation Queue (Admin)
router.get("/moderation-queue", verifyToken, getModerationQueue);
router.put("/:id/approve", verifyToken, approveReview);
router.put("/:id/reject", verifyToken, rejectReview);

export default router;
