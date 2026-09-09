import {
  mysqlTable,
  varchar,
  text,
  float,
  timestamp,
  index,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const reviewsTable = mysqlTable(
  "reviews",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`(UUID())`),

    collegeId: varchar("college_id", { length: 36 }).notNull(),
    userId: varchar("user_id", { length: 36 }),
    userName: varchar("user_name", { length: 150 }),
    rating: float("rating").notNull(),
    comment: text("comment"),

    status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, approved, rejected
    rejectionReason: text("rejection_reason"),
    moderatedAt: timestamp("moderated_at"),
    moderatedBy: varchar("moderated_by", { length: 36 }),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    collegeIdx: index("review_college_idx").on(table.collegeId),
  })
);
