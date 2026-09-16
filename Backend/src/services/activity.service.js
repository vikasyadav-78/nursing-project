import { prisma } from "../database/prisma.js";

export const logUserActivity = async ({ userId, eventType, metadata, ipAddress }) => {
  try {
    await prisma.activityLog.create({
      data: {
        userId: userId || null,
        eventType,
        metadata: metadata || {},
        ipAddress: ipAddress || null,
      },
    });
  } catch (err) {
    console.error("Activity Logging Error:", err);
  }
};

export const getActivitySummaryService = async () => {
  try {
    const recentLogs = await prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const counts = await prisma.activityLog.groupBy({
      by: ["eventType"],
      _count: {
        _all: true,
      },
    });

    const eventCounts = counts.map((item) => ({
      eventType: item.eventType,
      count: item._count._all,
    }));

    return {
      eventCounts,
      recentLogs,
    };
  } catch (err) {
    throw err;
  }
};
