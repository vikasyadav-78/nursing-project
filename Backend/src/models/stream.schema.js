import { mysqlTable, varchar, text, timestamp, boolean, uniqueIndex } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const streamsTable = mysqlTable(
  "streams",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`(UUID())`),

    name: varchar("name", { length: 100 }).notNull(),
    code: varchar("code", { length: 50 }).notNull(),
    description: text("description"),

    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    nameUnique: uniqueIndex("stream_name_unique").on(table.name),
    codeUnique: uniqueIndex("stream_code_unique").on(table.code),
  })
);
