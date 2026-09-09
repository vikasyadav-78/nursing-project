import {
  mysqlTable,
  varchar,
  int,
  json,
  timestamp,
  index,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const placementsTable = mysqlTable(
  "placements",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`(UUID())`),

    collegeId: varchar("college_id", { length: 36 }).notNull(),
    year: int("year").notNull(),
    highestPackage: varchar("highest_package", { length: 50 }),
    averagePackage: varchar("average_package", { length: 50 }),
    topRecruiters: json("top_recruiters").default(sql`(JSON_ARRAY())`),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    collegeIdx: index("placement_college_idx").on(table.collegeId),
  })
);
