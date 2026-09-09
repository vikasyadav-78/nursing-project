import { db } from "../database/db.js";
import { placementsTable } from "../models/placement.schema.js";
import { eq } from "drizzle-orm";

export const getPlacementsByCollege = async (req, res) => {
  try {
    const { collegeId } = req.params;
    const records = await db.select().from(placementsTable).where(eq(placementsTable.collegeId, collegeId));
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addPlacementRecord = async (req, res) => {
  try {
    const { collegeId, year, highestPackage, averagePackage, topRecruiters } = req.body;
    if (!collegeId || !year) {
      return res.status(400).json({ success: false, message: "College ID and year are required" });
    }

    await db.insert(placementsTable).values({
      collegeId,
      year: Number(year),
      highestPackage,
      averagePackage,
      topRecruiters: topRecruiters || [],
    });

    res.status(201).json({ success: true, message: "Placement record added successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
