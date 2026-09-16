import { prisma } from "../database/prisma.js";

export const getDashboardStats = async (req, res) => {
  try {
    const [colleges, leads, blogs, courses, exams] = await Promise.all([
      prisma.college.count(),
      prisma.lead.count(),
      prisma.blog.count(),
      prisma.course.count(),
      prisma.exam.count(),
    ]);

    res.json({
      success: true,
      data: {
        colleges,
        leads,
        blogs,
        courses,
        exams,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


