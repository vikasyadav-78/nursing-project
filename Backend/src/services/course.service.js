import { prisma } from "../database/prisma.js";
import { getOrSetCache, deleteCache, invalidatePattern } from "./cache.service.js";

export async function createCourse(data) {
  const existing = await prisma.course.findUnique({
    where: { code: data.code },
  });

  if (existing) {
    throw new Error("Course code already exists");
  }

  const createdCourse = await prisma.course.create({
    data,
  });

  await invalidatePattern("courses:list:*");
  return createdCourse;
}

export async function getCourses() {
  return await prisma.course.findMany();
}

export async function getCourseByIdService(id) {
  const cacheKey = `entity:course:${id}`;
  return await getOrSetCache(
    cacheKey,
    async () => {
      const course = await prisma.course.findUnique({
        where: { id },
      });
      return course || null;
    },
    3600
  );
}

export async function updateCourse(id, data) {
  const result = await prisma.course.update({
    where: { id },
    data,
  });

  await deleteCache(`entity:course:${id}`);
  await invalidatePattern("courses:list:*");
  return result;
}

export async function deleteCourse(id) {
  const result = await prisma.course.delete({
    where: { id },
  });

  await deleteCache(`entity:course:${id}`);
  await invalidatePattern("courses:list:*");
  return result;
}
