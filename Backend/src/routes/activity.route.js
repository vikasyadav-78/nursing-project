import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { getActivitySummaryService, logUserActivity } from "../services/activity.service.js";

const router = express.Router();

// Log activity event
router.post("/event", async (req, res) => {
  try {
    const { eventType, metadata } = req.body;
    if (!eventType) {
      return res.status(400).json({ success: false, message: "eventType is required" });
    }

    const userId = req.user?.id || req.body.userId || null;
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || null;

    await logUserActivity({ userId, eventType, metadata, ipAddress });
    res.json({ success: true, message: "Activity logged successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin activity summary
router.get("/summary", verifyToken, async (req, res) => {
  try {
    const summary = await getActivitySummaryService();
    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
