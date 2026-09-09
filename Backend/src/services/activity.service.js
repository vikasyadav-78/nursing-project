import { db } from "../database/db.js";
import { activityLogsTable } from "../models/activityLog.schema.js";
import { sql, desc } from "drizzle-orm";

export const logUserActivity = async ({ userId, eventType, metadata, ipAddress }) => {
  try {
    await db.insert(activityLogsTable).values({
      userId: userId || null,
      eventType,
      metadata: metadata || {},
      ipAddress: ipAddress || null,
    });
  } catch (err) {
    console.error("Activity Logging Error:", err);
  }
};

export const getActivitySummaryService = async () => {
  try {
    const recentLogs = await db
      .select()
      .from(activityLogsTable)
      .orderBy(desc(activityLogsTable.createdAt))
      .limit(50);

    const eventCounts = await db
      .select({
        eventType: activityLogsTable.eventType,
        count: sql`count(*)`,
      })
      .from(activityLogsTable)
      .groupBy(activityLogsTable.eventType);

    return {
      eventCounts,
      recentLogs,
    };
  } catch (err) {
    throw err;
  }
};
