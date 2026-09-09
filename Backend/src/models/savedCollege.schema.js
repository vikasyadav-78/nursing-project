import {
  mysqlTable,
  varchar,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const savedCollegesTable = mysqlTable(
  "saved_colleges",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`(UUID())`),

    userId: varchar("user_id", { length: 36 }).notNull(),
    collegeId: varchar("college_id", { length: 36 }).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userCollegeUnique: uniqueIndex("user_college_unique").on(
      table.userId,
      table.collegeId
    ),
    userIdIdx: index("saved_user_idx").on(table.userId),
  })
);
