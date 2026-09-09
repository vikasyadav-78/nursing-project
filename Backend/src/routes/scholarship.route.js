import express from "express";
import {
  getScholarshipsByCollege,
  addScholarship,
} from "../controller/scholarship.controller.js";

const router = express.Router();

router.get("/college/:collegeId", getScholarshipsByCollege);
router.post("/", addScholarship);

export default router;
