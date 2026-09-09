import {
  createLead,
  getLeads,
  deleteLead,
  updateLeadStatusService,
  assignCounsellorService,
  addFollowUpService,
} from "../services/lead.service.js";
import { createAuditLog } from "../services/audit.service.js";

export const addLead = async (req, res) => {
  try {
    const lead = await createLead(req.body);

    await createAuditLog({
      action: "CREATE",
      module: "Lead",
      description: `Lead registered/updated: ${req.body.name || req.body.phone}`,
      userAgent: req.headers["user-agent"],
    });

    res.json({
      success: true,
      message: "Enquiry submitted successfully!",
      data: lead,
    });
  } catch (error) {
    console.error("ADD LEAD ERROR:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllLeads = async (req, res) => {
  try {
    const data = await getLeads();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, message: "Status is required" });

    await updateLeadStatusService(id, status);
    res.json({ success: true, message: `Lead status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const assignCounsellor = async (req, res) => {
  try {
    const { id } = req.params;
    const { counsellorId, counsellorName } = req.body;

    await assignCounsellorService(id, { counsellorId, counsellorName });
    res.json({ success: true, message: "Counsellor assigned successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addFollowUp = async (req, res) => {
  try {
    const { id } = req.params;
    const { followUpDate, notes } = req.body;

    await addFollowUpService(id, { followUpDate, notes });
    res.json({ success: true, message: "Follow-up note & date saved successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeLead = async (req, res) => {
  try {
    await deleteLead(req.params.id);
    res.json({ success: true, message: "Lead deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
