import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../database/prisma.js";

export async function registerService({ username, firstName, lastName, email, password, role }) {
  const existingUser = await prisma.user.findFirst({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      username: username || email.split("@")[0],
      firstName: firstName || "User",
      lastName: lastName || "",
      email,
      password: hashedPassword,
      role: role || "admin",
    },
  });

  return {
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    },
  };
}

export async function loginService({ email, username, emailOrMobile, password }) {
  const identifier = email || username || emailOrMobile;
  if (!identifier) {
    throw new Error("Email, username, or mobile number is required");
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: identifier },
        { username: identifier },
        { mobile: identifier },
      ],
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

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
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
