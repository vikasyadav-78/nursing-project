import { db } from "../database/db.js";
import { eq, inArray } from "drizzle-orm";
import { collegesTable } from "../models/college.schema.js";
import { coursesTable } from "../models/course.schema.js";
import { getOrSetCache, deleteCache, invalidatePattern } from "./cache.service.js";

// Helper to safely parse JSON fields
const parseJsonField = (field, defaultValue = []) => {
  if (!field) return defaultValue;
  
  // If it's already an array/object, return as is
  if (typeof field === 'object') return field;
  
  // If it's a string, try to parse it
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch (error) {
      console.error('Error parsing JSON field:', error);
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
const parseCollegeData = (college) => {
  if (!college) return college;

  try {
    return {
      ...college,
      nirfRank: formatNirfRank(college.nirfRank),
      tuitionFeesDisplay: formatTuitionFees(college),
      // Parse gallery - handle both string and object cases
      gallery: parseJsonField(college.gallery, []),
      // Parse facilities
      facilities: parseJsonField(college.facilities, []),
      // Parse courseIds
      courseIds: parseJsonField(college.courseIds, []),
      // Parse examsAccepted
      examsAccepted: parseJsonField(college.examsAccepted, []),
    };
  } catch (err) {
    console.error("Error in parseCollegeData:", err);
    return college;
  }
};

export const createCollegeService = async (data) => {
  const [existing] = await db
    .select()
    .from(collegesTable)
    .where(eq(collegesTable.code, data.code));

  if (existing) {
    throw new Error("College code already exists");
  }

  await db.insert(collegesTable).values(data);

  const [createdCollege] = await db
    .select()
    .from(collegesTable)
    .where(eq(collegesTable.code, data.code));

  return parseCollegeData(createdCollege);
};

export const getAllCollegesService = async () => {
  const colleges = await db.select().from(collegesTable);
  
  // Parse JSON fields for all colleges
  return colleges.map(parseCollegeData);
};

export const getCollegeByIdService = async (id) => {
  const cacheKey = `entity:college:${id}`;
  return await getOrSetCache(cacheKey, async () => {
    const [college] = await db
      .select()
      .from(collegesTable)
      .where(eq(collegesTable.id, id));

    return parseCollegeData(college);
  }, 3600);
};

export const updateCollegeService = async (id, data) => {
  const result = await db
    .update(collegesTable)
    .set(data)
    .where(eq(collegesTable.id, id));

  // Cache Invalidation
  await deleteCache(`entity:college:${id}`);
  await invalidatePattern("colleges:list:*");

  return result;
};

export const deleteCollegeService = async (id) => {
  const result = await db
    .delete(collegesTable)
    .where(eq(collegesTable.id, id));

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

  return await db
    .select()
    .from(coursesTable)
    .where(inArray(coursesTable.id, courseIds));
};