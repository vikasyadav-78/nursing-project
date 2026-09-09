import {
  mysqlTable,
  varchar,
  int,
  boolean,
  index,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

// Many-to-Many: College <-> Course
export const collegeCoursesTable = mysqlTable(
  "college_courses",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`(UUID())`),

    collegeId: varchar("college_id", { length: 36 }).notNull(),
    courseId: varchar("course_id", { length: 36 }).notNull(),
    totalFees: varchar("total_fees", { length: 100 }),
    seats: int("seats"),
    cutoff: varchar("cutoff", { length: 100 }),
  },
  (table) => ({
    collegeIdx: index("cc_college_idx").on(table.collegeId),
    courseIdx: index("cc_course_idx").on(table.courseId),
  })
);

// Many-to-Many: Course <-> Entrance Exam
export const courseExamsTable = mysqlTable(
  "course_exams",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`(UUID())`),

    courseId: varchar("course_id", { length: 36 }).notNull(),
    examId: varchar("exam_id", { length: 36 }).notNull(),
    isMandatory: boolean("is_mandatory").default(true),
  },
  (table) => ({
    courseIdx: index("ce_course_idx").on(table.courseId),
    examIdx: index("ce_exam_idx").on(table.examId),
  })
);

// Many-to-Many: Exam <-> College
export const examCollegesTable = mysqlTable(
  "exam_colleges",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`(UUID())`),

    examId: varchar("exam_id", { length: 36 }).notNull(),
    collegeId: varchar("college_id", { length: 36 }).notNull(),
    acceptingStatus: varchar("accepting_status", { length: 100 }).default("Accepted"),
  },
  (table) => ({
    examIdx: index("ec_exam_idx").on(table.examId),
    collegeIdx: index("ec_college_idx").on(table.collegeId),
  })
);
