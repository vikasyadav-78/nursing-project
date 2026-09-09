import { db } from "../database/db.js";
import { scholarshipsTable } from "../models/scholarship.schema.js";
import { eq } from "drizzle-orm";

export const getScholarshipsByCollege = async (req, res) => {
  try {
    const { collegeId } = req.params;
    const items = await db.select().from(scholarshipsTable).where(eq(scholarshipsTable.collegeId, collegeId));
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addScholarship = async (req, res) => {
  try {
    const { collegeId, name, amount, eligibility } = req.body;
    if (!collegeId || !name) {
      return res.status(400).json({ success: false, message: "College ID and scholarship name are required" });
    }

    await db.insert(scholarshipsTable).values({ collegeId, name, amount, eligibility });
    res.status(201).json({ success: true, message: "Scholarship added successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
