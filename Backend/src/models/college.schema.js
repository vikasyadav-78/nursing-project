import {
  mysqlTable,
  varchar,
  text,
  int,
  json,
  timestamp,
  mysqlEnum,
  boolean,
  index,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const collegesTable = mysqlTable(
  "colleges",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`(UUID())`),

    name: varchar("name", { length: 255 }).notNull(),
    code: varchar("code", { length: 100 }).notNull().unique(),

    description: text("description"),

    sector: mysqlEnum("sector", ["Private", "Government", "Semi-Govt"])
      .default("Private"),

    genderAcceptance: mysqlEnum("gender_acceptance", [
      "Co-ed",
      "Boys",
      "Girls",
    ]).default("Co-ed"),

    establishedYear: int("established_year"),

    state: varchar("state", { length: 100 }),
    district: varchar("district", { length: 100 }),
    city: varchar("city", { length: 100 }),
    address: text("address"),

    googleMapLink: text("google_map_link"),

    affiliation: text("affiliation"),
    approvedBy: text("approved_by"),

    coursesCount: int("courses_count"),
    experienceYears: int("experience_years"),
    studentsCount: int("students_count"),

    facilities: json("facilities").default([]),
    gallery: json("gallery").default([]),

    thumbnail: varchar("thumbnail", { length: 255 }),
    youtubeVideo: text("youtube_video"),

    courseIds: json("course_ids").default(sql`(JSON_ARRAY())`),
    stream: varchar("stream", { length: 100 }), // Medical, Nursing, Engineering, Management, Computer, Law, etc.
    rating: varchar("rating", { length: 10 }),
    nirfRank: varchar("nirf_rank", { length: 50 }),
    minFee: int("min_fee"),
    maxFee: int("max_fee"),
    tuitionFeesDisplay: varchar("tuition_fees_display", { length: 100 }),
    examsAccepted: json("exams_accepted").default(sql`(JSON_ARRAY())`),
    accreditation: varchar("accreditation", { length: 100 }),
    brochureUrl: text("brochure_url"),
    specialization: varchar("specialization", { length: 255 }),
    programMode: varchar("program_mode", { length: 50 }),
    courseType: varchar("course_type", { length: 50 }),
    isFeatured: boolean("is_featured").default(false),
    isPopular: boolean("is_popular").default(false),
    createdAt: timestamp("created_at").defaultNow(),
  },

  (table) => ({
    nameIndex: index("college_name_idx").on(table.name),
    cityIndex: index("college_city_idx").on(table.city),
    codeIndex: index("college_code_idx").on(table.code),
  })
);
