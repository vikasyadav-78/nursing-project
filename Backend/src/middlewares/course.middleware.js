import { prisma } from "../database/prisma.js";

export const checkCourseExists = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const course = await prisma.course.findUnique({
      where: { id: String(id) },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error checking course",
    });
  }
};
