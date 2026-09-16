import { prisma } from "../database/prisma.js";

export const createAuditLog = async ({
  action,
  module,
  description,
  userAgent,
}) => {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        module,
        description,
        userAgent,
      },
    });
  } catch (error) {
    console.error("Audit Log Error:", error.message);
  }
};
