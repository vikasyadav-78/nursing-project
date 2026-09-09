import { mysqlTable, varchar, timestamp, int, text, json } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const leadsTable = mysqlTable("leads", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`(UUID())`),

  name: varchar("name", { length: 150 }),
  email: varchar("email", { length: 150 }),
  phone: varchar("phone", { length: 20 }).notNull(),

  state: varchar("state", { length: 100 }),
  city: varchar("city", { length: 100 }),
  course: varchar("course", { length: 150 }),
  stream: varchar("stream", { length: 100 }),
  level: varchar("level", { length: 100 }),
  college: varchar("college", { length: 150 }),

  message: text("message"),

  // Lifecycle Stage & Scoring
  status: varchar("status", { length: 50 }).default("NEW").notNull(),
  score: int("score").default(50),

  // Counsellor Assignment
  counsellorId: varchar("counsellor_id", { length: 36 }),
  counsellorName: varchar("counsellor_name", { length: 150 }),

  // Follow up & Activity Log
  followUpDate: timestamp("follow_up_date"),
  followUpNotes: text("follow_up_notes"),
  activityHistory: json("activity_history").default(sql`(JSON_ARRAY())`),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
