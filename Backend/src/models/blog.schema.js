import { mysqlTable, varchar, text, timestamp, uniqueIndex } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const blogsTable = mysqlTable(
  "blogs",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`(UUID())`),

    title: varchar("title", { length: 255 }).notNull(),
    code: varchar("code", { length: 100 }).notNull(),

    contentType: varchar("content_type", { length: 50 }).default("Article").notNull(), // Article, News, Exam Update, Admission Update, Syllabus, Guide
    description: text("description").notNull(),
    image: varchar("image", { length: 255 }),

    status: varchar("status", { length: 30 }).default("DRAFT").notNull(), // DRAFT, REVIEW, PUBLISHED, ARCHIVED
    authorId: varchar("author_id", { length: 36 }),
    authorName: varchar("author_name", { length: 150 }),

    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => ({
    codeUnique: uniqueIndex("blog_code_unique").on(table.code),
  })
);
