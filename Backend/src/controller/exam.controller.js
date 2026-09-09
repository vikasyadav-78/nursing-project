import { db } from "../database/db.js";
import { examsTable } from "../models/exam.schema.js";
import { eq, like, or } from "drizzle-orm";
import { getOrSetCache, deleteCache, invalidatePattern } from "../services/cache.service.js";

export const getExams = async (req, res) => {
  try {
    const { search, category, trending } = req.query;
    let query = db.select().from(examsTable);

    const exams = await query;
    let results = exams;

    if (trending === "true") {
      results = results.filter((e) => e.isTrending === true);
    }

    if (search) {
      const term = search.toLowerCase();
      results = results.filter(
        (e) =>
          e.name.toLowerCase().includes(term) ||
          e.code.toLowerCase().includes(term)
      );
    }

    if (category) {
      results = results.filter(
        (e) => e.category?.toLowerCase() === category.toLowerCase()
      );
    }

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getExamById = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `entity:exam:${id}`;

    const exam = await getOrSetCache(cacheKey, async () => {
      const [found] = await db
        .select()
        .from(examsTable)
        .where(eq(examsTable.id, id));
      return found || null;
    }, 3600);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    res.json({
      success: true,
      data: exam,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createExam = async (req, res) => {
  try {
    const {
      name,
      code,
      category,
      examLevel,
      description,
      applicationStartDate,
      applicationEndDate,
      examDate,
      resultDate,
      officialWebsite,
      isTrending,
    } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: "Exam name and code are required",
      });
    }

    await db.insert(examsTable).values({
      name,
      code,
      category,
      examLevel,
      description,
      applicationStartDate: applicationStartDate ? new Date(applicationStartDate) : null,
      applicationEndDate: applicationEndDate ? new Date(applicationEndDate) : null,
      examDate: examDate ? new Date(examDate) : null,
      resultDate: resultDate ? new Date(resultDate) : null,
      officialWebsite,
      isTrending: isTrending === true || isTrending === "true",
    });

    const [createdExam] = await db
      .select()
      .from(examsTable)
      .where(eq(examsTable.code, code));

    await invalidatePattern("exams:list:*");

    res.status(201).json({
      success: true,
      message: "Exam created successfully",
      data: createdExam,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.applicationStartDate) {
      updateData.applicationStartDate = new Date(updateData.applicationStartDate);
    }
    if (updateData.applicationEndDate) {
      updateData.applicationEndDate = new Date(updateData.applicationEndDate);
    }
    if (updateData.examDate) {
      updateData.examDate = new Date(updateData.examDate);
    }
    if (updateData.resultDate) {
      updateData.resultDate = new Date(updateData.resultDate);
    }

    await db.update(examsTable).set(updateData).where(eq(examsTable.id, id));

    await deleteCache(`entity:exam:${id}`);
    await invalidatePattern("exams:list:*");

    res.json({
      success: true,
      message: "Exam updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(examsTable).where(eq(examsTable.id, id));

    await deleteCache(`entity:exam:${id}`);
    await invalidatePattern("exams:list:*");

    res.json({
      success: true,
      message: "Exam deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
