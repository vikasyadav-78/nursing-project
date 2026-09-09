import {
  mysqlTable,
  varchar,
  int,
  timestamp,
  index,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const universitiesTable = mysqlTable(
  "universities",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`(UUID())`),

    name: varchar("name", { length: 255 }).notNull(),
    type: varchar("type", { length: 100 }), // Central, State, Private, Deemed
    location: varchar("location", { length: 255 }),
    establishedYear: int("established_year"),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => ({
    nameIdx: index("univ_name_idx").on(table.name),
  })
);
