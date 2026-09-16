import { prisma } from "../database/prisma.js";

export const getScholarshipsByCollege = async (req, res) => {
  try {
    const { collegeId } = req.params;
    const items = await prisma.scholarship.findMany({
      where: { collegeId: String(collegeId) },
    });
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

    await prisma.scholarship.create({
      data: {
        collegeId: String(collegeId),
        name,
        amount,
        eligibility,
      },
    });
    res.status(201).json({ success: true, message: "Scholarship added successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

