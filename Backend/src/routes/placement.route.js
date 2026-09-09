import express from "express";
import {
  getPlacementsByCollege,
  addPlacementRecord,
} from "../controller/placement.controller.js";

const router = express.Router();

router.get("/college/:collegeId", getPlacementsByCollege);
router.post("/", addPlacementRecord);

export default router;
