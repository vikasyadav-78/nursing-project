import express from "express";
import {
  getUniversities,
  getUniversityById,
  createUniversity,
} from "../controller/university.controller.js";

const router = express.Router();

router.get("/", getUniversities);
router.get("/:id", getUniversityById);
router.post("/", createUniversity);

export default router;
