import { loginService, registerService, getMeService } from "../services/auth.service.js";
import { createAuditLog } from "../services/audit.service.js";

export async function register(req, res) {
  try {
    const result = await registerService(req.body);
    await createAuditLog({
      action: "REGISTER",
      module: "Auth",
      description: `User registered: ${result.user.email}`,
      userAgent: req.headers["user-agent"],
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: result.user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function login(req, res) {
  try {
    const result = await loginService(req.body);

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    await createAuditLog({
      action: "LOGIN",
      module: "Auth",
      description: `User logged in: ${result.user.email}`,
      userAgent: req.headers["user-agent"],
    });

    res.json({
      success: true,
      message: "Login successful",
      token: result.token,
      user: result.user,
    });

  } catch (error) {

    await createAuditLog({
      action: "FAILED_LOGIN",
      module: "Auth",
      description: `Failed login attempt: ${req.body.email}`,
      userAgent: req.headers["user-agent"],
    });

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getMe(req, res) {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const user = await getMeService(token);
    res.json({ success: true, user });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
}
