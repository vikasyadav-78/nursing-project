import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  index,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const scholarshipsTable = mysqlTable(
  "scholarships",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`(UUID())`),

    collegeId: varchar("college_id", { length: 36 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    amount: varchar("amount", { length: 100 }),
    eligibility: text("eligibility"),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    collegeIdx: index("scholarship_college_idx").on(table.collegeId),
  })
);
