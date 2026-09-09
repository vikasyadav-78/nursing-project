import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  boolean,
  index,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const examsTable = mysqlTable(
  "exams",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`(UUID())`),

    name: varchar("name", { length: 255 }).notNull(),
    code: varchar("code", { length: 100 }).notNull().unique(),
    category: varchar("category", { length: 100 }), // Medical, Nursing, Engineering, Management
    examLevel: varchar("exam_level", { length: 50 }).default("National"), // National, State, University
    description: text("description"),

    applicationStartDate: timestamp("application_start_date").default(null),
    applicationEndDate: timestamp("application_end_date").default(null),
    examDate: timestamp("exam_date").default(null),
    resultDate: timestamp("result_date").default(null),

    officialWebsite: text("official_website"),
    isTrending: boolean("is_trending").default(false),
    isActive: boolean("is_active").default(true),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => ({
    nameIdx: index("exam_name_idx").on(table.name),
    codeIdx: index("exam_code_idx").on(table.code),
    categoryIdx: index("exam_category_idx").on(table.category),
  })
);
