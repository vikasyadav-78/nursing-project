import { db } from "../database/db.js";
import { blogsTable } from "../models/blog.schema.js";
import { eq } from "drizzle-orm";
import { getOrSetCache, deleteCache, invalidatePattern } from "./cache.service.js";

export const createBlog = async (data) => {
  const existing = await db
    .select()
    .from(blogsTable)
    .where(eq(blogsTable.code, data.code));

  if (existing.length > 0) {
    throw new Error("Blog with this code already exists");
  }

  await db.insert(blogsTable).values(data);

  const [createdBlog] = await db
    .select()
    .from(blogsTable)
    .where(eq(blogsTable.code, data.code));

  await invalidatePattern("blogs:list:*");
  return createdBlog;
};

export const getBlogs = async (status = "PUBLISHED") => {
  if (status === "ALL") {
    return await db.select().from(blogsTable);
  }
  return await db.select().from(blogsTable).where(eq(blogsTable.status, status));
};

export const getBlogByIdService = async (id) => {
  const cacheKey = `entity:blog:${id}`;
  return await getOrSetCache(cacheKey, async () => {
    const [blog] = await db
      .select()
      .from(blogsTable)
      .where(eq(blogsTable.id, id));

    return blog || null;
  }, 3600);
};

export const deleteBlog = async (id) => {
  const result = await db.delete(blogsTable).where(eq(blogsTable.id, id));
  await deleteCache(`entity:blog:${id}`);
  await invalidatePattern("blogs:list:*");
  return result;
};
