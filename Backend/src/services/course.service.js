import { eq } from "drizzle-orm";
import { coursesTable } from "../models/course.schema.js";
import { db } from "../database/db.js";
import { getOrSetCache, deleteCache, invalidatePattern } from "./cache.service.js";

export async function createCourse(data) {
  const existing = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.code, data.code));

  if (existing.length > 0) {
    throw new Error("Course code already exists");
  }

  await db.insert(coursesTable).values(data);

  const [createdCourse] = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.code, data.code));

  await invalidatePattern("courses:list:*");
  return createdCourse;
}

export async function getCourses() {
  return await db.select().from(coursesTable);
}

export async function getCourseByIdService(id) {
  const cacheKey = `entity:course:${id}`;
  return await getOrSetCache(cacheKey, async () => {
    const [course] = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.id, id));

    return course || null;
  }, 3600);
}

export async function updateCourse(id, data) {
  const result = await db
    .update(coursesTable)
    .set(data)
    .where(eq(coursesTable.id, id));

  await deleteCache(`entity:course:${id}`);
  await invalidatePattern("courses:list:*");
  return result;
}

export async function deleteCourse(id) {
  const result = await db
    .delete(coursesTable)
    .where(eq(coursesTable.id, id));

  await deleteCache(`entity:course:${id}`);
  await invalidatePattern("courses:list:*");
  return result;
}

