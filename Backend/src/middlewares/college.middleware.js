import { prisma } from "../database/prisma.js";

export async function checkCollegeExists(req, res, next) {
  try {
    const { collegeId, id } = req.params;
    const targetId = collegeId || id;

    if (!targetId) {
      return res.status(400).json({
        success: false,
        message: "Invalid college ID",
      });
    }

    const college = await prisma.college.findUnique({
      where: { id: String(targetId) },
    });

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    req.college = college;
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}
