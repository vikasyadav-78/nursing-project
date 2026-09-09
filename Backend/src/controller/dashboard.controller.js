import { db } from "../database/db.js";
import { collegesTable } from "../models/college.schema.js";
import { leadsTable } from "../models/lead.schema.js";
import { blogsTable } from "../models/blog.schema.js";
import { coursesTable } from "../models/course.schema.js";
import { examsTable } from "../models/exam.schema.js";
import { sql } from "drizzle-orm";

export const getDashboardStats = async (req, res) => {
  try {
    const [colleges] = await db.select({
      count: sql`COUNT(*)`
    }).from(collegesTable);

    const [leads] = await db.select({
      count: sql`COUNT(*)`
    }).from(leadsTable);

    const [blogs] = await db.select({
      count: sql`COUNT(*)`
    }).from(blogsTable);

    const [courses] = await db.select({
      count: sql`COUNT(*)`
    }).from(coursesTable);

    const [exams] = await db.select({
      count: sql`COUNT(*)`
    }).from(examsTable);

    res.json({
      success: true,
      data: {
        colleges: Number(colleges?.count || 0),
        leads: Number(leads?.count || 0),
        blogs: Number(blogs?.count || 0),
        courses: Number(courses?.count || 0),
        exams: Number(exams?.count || 0),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

