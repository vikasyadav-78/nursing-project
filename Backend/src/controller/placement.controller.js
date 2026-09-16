import { prisma } from "../database/prisma.js";

export const getPlacementsByCollege = async (req, res) => {
  try {
    const { collegeId } = req.params;
    const records = await prisma.placement.findMany({
      where: { collegeId: String(collegeId) },
    });
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

    await prisma.placement.create({
      data: {
        collegeId: String(collegeId),
        year: Number(year),
        highestPackage,
        averagePackage,
        topRecruiters: topRecruiters || [],
      },
    });

    res.status(201).json({ success: true, message: "Placement record added successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

