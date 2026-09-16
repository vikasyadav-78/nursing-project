import { prisma } from "../database/prisma.js";
import { getOrSetCache, deleteCache, invalidatePattern } from "../services/cache.service.js";

export const getExams = async (req, res) => {
  try {
    const { search, category, trending } = req.query;
    const exams = await prisma.exam.findMany();
    let results = exams;

    if (trending === "true") {
      results = results.filter((e) => e.isTrending === true);
    }

    if (search) {
      const term = search.toLowerCase();
      results = results.filter(
        (e) =>
          (e.name && e.name.toLowerCase().includes(term)) ||
          (e.code && e.code.toLowerCase().includes(term))
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
    const examId = String(id);
    const cacheKey = `entity:exam:${id}`;

    const exam = await getOrSetCache(cacheKey, async () => {
      return await prisma.exam.findUnique({
        where: { id: examId },
      });
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

    const createdExam = await prisma.exam.create({
      data: {
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
      },
    });

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
    const examId = String(id);
    const updateData = { ...req.body };

    delete updateData.id;
    delete updateData.createdAt;

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
    if (updateData.isTrending !== undefined) {
      updateData.isTrending = updateData.isTrending === true || updateData.isTrending === "true";
    }

    await prisma.exam.update({
      where: { id: examId },
      data: updateData,
    });

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
    const examId = String(id);

    await prisma.exam.delete({
      where: { id: examId },
    });

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

