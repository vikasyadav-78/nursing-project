import { prisma } from "../database/prisma.js";
import { getOrSetCache, deleteCache, invalidatePattern } from "./cache.service.js";

// Helper to safely parse JSON fields
const parseJsonField = (field, defaultValue = []) => {
  if (!field) return defaultValue;
  if (typeof field === "object") return field;
  if (typeof field === "string") {
    try {
      return JSON.parse(field);
    } catch (error) {
      console.error("Error parsing JSON field:", error);
      return defaultValue;
    }
  }
  return defaultValue;
};

export const formatNirfRank = (rank) => {
  if (rank === null || rank === undefined || rank === "") return null;
  const str = String(rank).trim();
  if (!str) return null;
  if (str.startsWith("#")) return str;
  const num = str.replace(/\D/g, "");
  if (num) return `# ${num} NIRF`;
  return str;
};

export const formatFeeNumber = (num) => {
  const n = Number(num);
  if (isNaN(n) || n <= 0) return "";
  if (n >= 100000) {
    const lakhs = n / 100000;
    return `${Number.isInteger(lakhs) ? lakhs : lakhs.toFixed(1)} L`;
  }
  if (n >= 1000) {
    const k = n / 1000;
    return `${Number.isInteger(k) ? k : k.toFixed(1)} K`;
  }
  return `${n}`;
};

export const formatTuitionFees = (college) => {
  if (!college) return null;
  let display = college.tuitionFeesDisplay ? String(college.tuitionFeesDisplay).trim() : null;

  if (!display) {
    const minF = college.minFee;
    const maxF = college.maxFee;
    if (minF && maxF && minF !== maxF) {
      display = `${formatFeeNumber(minF)} - ${formatFeeNumber(maxF)}`;
    } else if (minF || maxF) {
      display = formatFeeNumber(minF || maxF);
    }
  }

  if (!display) return null;
  if (!display.includes("₹")) {
    return `₹${display}`;
  }
  return display;
};

// Helper function to parse college data
export const parseCollegeData = (college) => {
  if (!college) return college;

  try {
    return {
      ...college,
      nirfRank: formatNirfRank(college.nirfRank),
      tuitionFeesDisplay: formatTuitionFees(college),
      gallery: parseJsonField(college.gallery, []),
      facilities: parseJsonField(college.facilities, []),
      courseIds: parseJsonField(college.courseIds, []),
      examsAccepted: parseJsonField(college.examsAccepted, []),
    };
  } catch (err) {
    console.error("Error in parseCollegeData:", err);
    return college;
  }
};

export const createCollegeService = async (data) => {
  const existing = await prisma.college.findUnique({
    where: { code: data.code },
  });

  if (existing) {
    throw new Error("College code already exists");
  }

  const createdCollege = await prisma.college.create({
    data,
  });

  await invalidatePattern("colleges:list:*");
  return parseCollegeData(createdCollege);
};

export const getAllCollegesService = async () => {
  const colleges = await prisma.college.findMany();
  return colleges.map(parseCollegeData);
};

export const getCollegeByIdService = async (id) => {
  const cacheKey = `entity:college:${id}`;
  return await getOrSetCache(
    cacheKey,
    async () => {
      const college = await prisma.college.findUnique({
        where: { id },
      });

      return parseCollegeData(college);
    },
    3600
  );
};

export const updateCollegeService = async (id, data) => {
  const result = await prisma.college.update({
    where: { id },
    data,
  });

  // Cache Invalidation
  await deleteCache(`entity:college:${id}`);
  await invalidatePattern("colleges:list:*");

  return parseCollegeData(result);
};

export const deleteCollegeService = async (id) => {
  const result = await prisma.college.delete({
    where: { id },
  });

  // Cache Invalidation
  await deleteCache(`entity:college:${id}`);
  await invalidatePattern("colleges:list:*");

  return result;
};

export const getCollegeCoursesService = async (id) => {
  const college = await getCollegeByIdService(id);

  if (!college) throw new Error("College not found");

  const courseIds = parseJsonField(college.courseIds, []);

  if (!courseIds.length) return [];

  return await prisma.course.findMany({
    where: {
      id: { in: courseIds },
    },
  });
};

export const bulkCreateCollegesService = async (collegesArray) => {
  let createdCount = 0;
  let updatedCount = 0;
  let errors = [];

  for (let i = 0; i < collegesArray.length; i++) {
    const item = collegesArray[i];
    try {
      if (!item.name) continue;

      let code = item.code ? String(item.code).trim() : String(item.name).toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Math.floor(1000 + Math.random() * 9000);

      const existing = await prisma.college.findUnique({
        where: { code },
      });

      const collegeData = {
        name: String(item.name).trim(),
        code: code,
        description: item.description ? String(item.description) : null,
        sector: item.sector ? String(item.sector) : "Private",
        genderAcceptance: item.genderAcceptance ? String(item.genderAcceptance) : "Co-ed",
        establishedYear: item.establishedYear ? Number(item.establishedYear) : null,
        state: item.state ? String(item.state) : null,
        city: item.city ? String(item.city) : null,
        district: item.district ? String(item.district) : null,
        address: item.address ? String(item.address) : null,
        googleMapLink: item.googleMapLink ? String(item.googleMapLink) : null,
        affiliation: item.affiliation ? String(item.affiliation) : null,
        approvedBy: item.approvedBy ? String(item.approvedBy) : null,
        coursesCount: item.coursesCount ? Number(item.coursesCount) : null,
        studentsCount: item.studentsCount ? Number(item.studentsCount) : null,
        stream: item.stream ? String(item.stream) : "Nursing",
        rating: item.rating ? String(item.rating) : "4.2",
        nirfRank: item.nirfRank ? String(item.nirfRank) : null,
        tuitionFeesDisplay: item.tuitionFeesDisplay ? String(item.tuitionFeesDisplay) : null,
        isFeatured: Boolean(item.isFeatured === true || String(item.isFeatured).toLowerCase() === "true" || String(item.isFeatured) === "1"),
        isPopular: Boolean(item.isPopular === true || String(item.isPopular).toLowerCase() === "true" || String(item.isPopular) === "1"),
      };

      if (existing) {
        await prisma.college.update({
          where: { id: existing.id },
          data: collegeData,
        });
        updatedCount++;
      } else {
        await prisma.college.create({
          data: collegeData,
        });
        createdCount++;
      }
    } catch (err) {
      console.error(`Error bulk importing college row ${i + 1}:`, err);
      errors.push({ row: i + 1, college: item.name, error: err.message });
    }
  }

  await invalidatePattern("colleges:list:*");
  return { createdCount, updatedCount, totalProcessed: collegesArray.length, errors };
};