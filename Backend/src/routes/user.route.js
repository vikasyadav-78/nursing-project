import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  getMyProfile,
  updateMyProfile,
  saveCollege,
  getSavedColleges,
  removeSavedCollege,
} from "../controller/user.controller.js";

const router = Router();

router.get("/me", verifyToken, getMyProfile);
router.put("/me", verifyToken, updateMyProfile);

// Flow 1: Saved Colleges
router.post("/saved-colleges", verifyToken, saveCollege);
router.get("/saved-colleges", verifyToken, getSavedColleges);
router.delete("/saved-colleges/:collegeId", verifyToken, removeSavedCollege);

export default router;
