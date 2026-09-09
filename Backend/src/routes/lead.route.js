import { Router } from "express";
import {
  addLead,
  getAllLeads,
  removeLead,
  updateLeadStatus,
  assignCounsellor,
  addFollowUp,
} from "../controller/lead.controller.js";

import { validate } from "../middlewares/validate.js";
import { createLeadSchema } from "../validation/lead.validation.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", validate(createLeadSchema), addLead);
router.get("/", getAllLeads);
router.delete("/:id", removeLead);

// Lead Lifecycle Stage & Counsellor Management Routes
router.put("/:id/status", verifyToken, updateLeadStatus);
router.put("/:id/assign", verifyToken, assignCounsellor);
router.post("/:id/follow-up", verifyToken, addFollowUp);

export default router;
