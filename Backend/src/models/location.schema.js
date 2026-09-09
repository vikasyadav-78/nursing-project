import {
  mysqlTable,
  varchar,
  int,
  index,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const statesTable = mysqlTable(
  "states",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`(UUID())`),

    name: varchar("name", { length: 100 }).notNull().unique(),
  },
  (table) => ({
    nameIdx: index("state_name_idx").on(table.name),
  })
);

export const citiesTable = mysqlTable(
  "cities",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`(UUID())`),

    stateId: varchar("state_id", { length: 36 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
  },
  (table) => ({
    stateIdx: index("city_state_idx").on(table.stateId),
    nameIdx: index("city_name_idx").on(table.name),
  })
);
