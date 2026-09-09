import { db } from "../database/db.js";
import { universitiesTable } from "../models/university.schema.js";
import { eq } from "drizzle-orm";
import { getOrSetCache, deleteCache, invalidatePattern } from "../services/cache.service.js";

export const getUniversities = async (req, res) => {
  try {
    const list = await db.select().from(universitiesTable);
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUniversityById = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `entity:university:${id}`;
    const univ = await getOrSetCache(cacheKey, async () => {
      const [found] = await db.select().from(universitiesTable).where(eq(universitiesTable.id, id));
      return found || null;
    }, 3600);

    if (!univ) return res.status(404).json({ success: false, message: "University not found" });
    res.json({ success: true, data: univ });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createUniversity = async (req, res) => {
  try {
    const { name, type, location, establishedYear } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "University name is required" });

    await db.insert(universitiesTable).values({ name, type, location, establishedYear });
    await invalidatePattern("universities:list:*");
    res.status(201).json({ success: true, message: "University created successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
