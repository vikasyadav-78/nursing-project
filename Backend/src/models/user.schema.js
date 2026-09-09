import {
  mysqlTable,
  varchar,
  timestamp,
  boolean,
  json,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const usersTable = mysqlTable(
  "users",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`(UUID())`),

    username: varchar("username", { length: 100 }).notNull(),

    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),

    email: varchar("email", { length: 150 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),

    role: varchar("role", { length: 20 })
      .default("admin")
      .notNull(),

    mobile: varchar("mobile", { length: 20 }),
    location: varchar("location", { length: 150 }),
    educationLevel: varchar("education_level", { length: 100 }),
    coursePreferences: json("course_preferences").default(sql`(JSON_ARRAY())`),
    examPreferences: json("exam_preferences").default(sql`(JSON_ARRAY())`),
    budget: varchar("budget", { length: 100 }),
    careerInterests: json("career_interests").default(sql`(JSON_ARRAY())`),

    isActive: boolean("is_active").default(true),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    emailIndex: uniqueIndex("email_unique").on(table.email),
    usernameIndex: uniqueIndex("username_unique").on(table.username),
    roleIndex: index("role_index").on(table.role),
  })
);
