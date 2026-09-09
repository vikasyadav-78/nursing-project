import {
  mysqlTable,
  varchar,
  json,
  timestamp,
  index,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const activityLogsTable = mysqlTable(
  "activity_logs",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`(UUID())`),

    userId: varchar("user_id", { length: 36 }),
    eventType: varchar("event_type", { length: 50 }).notNull(), // search, view_college, view_course, view_exam, save_college, compare, review, enquiry
    metadata: json("metadata").default(sql`(JSON_OBJECT())`),
    ipAddress: varchar("ip_address", { length: 45 }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userEventTypeIdx: index("user_event_idx").on(table.userId, table.eventType),
    createdAtIdx: index("activity_created_idx").on(table.createdAt),
  })
);
