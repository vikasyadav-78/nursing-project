import { db } from "../database/db.js";
import { streamsTable } from "../models/stream.schema.js";
import { eq } from "drizzle-orm";

export const createStream = async (data) => {
  const existing = await db
    .select()
    .from(streamsTable)
    .where(eq(streamsTable.name, data.name));

  if (existing.length > 0) {
    throw new Error("Stream with this name already exists");
  }

  await db.insert(streamsTable).values(data);

  const [created] = await db
    .select()
    .from(streamsTable)
    .where(eq(streamsTable.name, data.name));

  return created;
};

export const getStreams = async () => {
  return await db.select().from(streamsTable);
};

export const deleteStream = async (id) => {
  return await db.delete(streamsTable).where(eq(streamsTable.id, id));
};
