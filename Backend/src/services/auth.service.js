import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";

import { usersTable } from "../models/user.schema.js";
import { db } from "../database/db.js";

export async function registerService({ username, firstName, lastName, email, password, role }) {
  const existingUsers = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (existingUsers.length > 0) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.insert(usersTable).values({
    username: username || email.split("@")[0],
    firstName: firstName || "User",
    lastName: lastName || "",
    email,
    password: hashedPassword,
    role: role || "admin",
  });

  return {
    user: {
      username,
      email,
      role: role || "admin",
    },
  };
}

export async function loginService({ email, password }) {
  
  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (users.length === 0) {
    throw new Error("User not found");
  }

  const user = users[0];

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid password");
  }

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET || "default_jwt_secret",
    { expiresIn: "1d" }
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  };
}

export async function getMeService(token) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_jwt_secret");
  const users = await db.select().from(usersTable).where(eq(usersTable.id, decoded.id));
  if (users.length === 0) {
    throw new Error("User not found");
  }
  const user = users[0];
  delete user.password;
  return user;
}
