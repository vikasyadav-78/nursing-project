import { prisma } from "../database/prisma.js";
import { getOrSetCache, deleteCache, invalidatePattern } from "./cache.service.js";

export const createBlog = async (data) => {
  const existing = await prisma.blog.findUnique({
    where: { code: data.code },
  });

  if (existing) {
    throw new Error("Blog with this code already exists");
  }

  const createdBlog = await prisma.blog.create({
    data,
  });

  await invalidatePattern("blogs:list:*");
  return createdBlog;
};

export const getBlogs = async (status = "PUBLISHED") => {
  if (status === "ALL") {
    return await prisma.blog.findMany();
  }
  return await prisma.blog.findMany({
    where: { status },
  });
};

export const getBlogByIdService = async (id) => {
  const cacheKey = `entity:blog:${id}`;
  return await getOrSetCache(
    cacheKey,
    async () => {
      const blog = await prisma.blog.findUnique({
        where: { id },
      });
      return blog || null;
    },
    3600
  );
};

export const deleteBlog = async (id) => {
  const result = await prisma.blog.delete({
    where: { id },
  });
  await deleteCache(`entity:blog:${id}`);
  await invalidatePattern("blogs:list:*");
  return result;
};
