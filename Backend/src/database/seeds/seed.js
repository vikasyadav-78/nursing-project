import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma.js";

console.log("🚀 Seed file started...");

(async () => {
  try {
    const email = "admin@nursing.com";

    console.log("🔍 Checking existing user...");

    const existing = await prisma.user.findFirst({
      where: { username: "admin" },
    });

    const hash = await bcrypt.hash("admin@123", 10);

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { email: "admin@nursing.com", password: hash },
      });
      console.log("✅ Admin password reset to admin@123");
      process.exit(0);
    }

    await prisma.user.create({
      data: {
        id: randomUUID(),
        username: "admin",
        firstName: "Nursing",
        lastName: "Admin",
        email,
        password: hash,
        role: "admin",
        isActive: true,
      },
    });

    console.log("✅ Admin created successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();

