import { prisma } from "../database/prisma.js";
import bcrypt from "bcryptjs";
import { createAuditLog } from "../services/audit.service.js";

export const getMyProfile = async (req, res) => {
  try {
    const userId = String(req.user.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        mobile: true,
        location: true,
        educationLevel: true,
        coursePreferences: true,
        examPreferences: true,
        budget: true,
        careerInterests: true,
        isActive: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const userId = String(req.user.id);
    const {
      firstName,
      lastName,
      username,
      email,
      mobile,
      location,
      educationLevel,
      coursePreferences,
      examPreferences,
      budget,
      careerInterests,
      currentPassword,
      newPassword,
    } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Password verification only if password or sensitive email/username is changed
    if (currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }
    }

    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (mobile !== undefined) updateData.mobile = mobile;
    if (location !== undefined) updateData.location = location;
    if (educationLevel !== undefined) updateData.educationLevel = educationLevel;
    if (coursePreferences !== undefined) updateData.coursePreferences = coursePreferences;
    if (examPreferences !== undefined) updateData.examPreferences = examPreferences;
    if (budget !== undefined) updateData.budget = budget;
    if (careerInterests !== undefined) updateData.careerInterests = careerInterests;

    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 6 characters",
        });
      }
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    await createAuditLog({
      action: "UPDATE_PROFILE",
      module: "User",
      description: `User profile updated: ${user.email}`,
      userAgent: req.headers["user-agent"],
    });

    return res.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// --- FLOW 1: SAVE COLLEGE CONTROLLERS ---

export const saveCollege = async (req, res) => {
  try {
    const userId = String(req.user.id);
    const collegeId = String(req.body.collegeId);

    if (!req.body.collegeId) {
      return res.status(400).json({ success: false, message: "College ID is required" });
    }

    const existing = await prisma.savedCollege.findFirst({
      where: { userId, collegeId },
    });

    if (existing) {
      return res.status(400).json({ success: false, message: "College is already saved" });
    }

    await prisma.savedCollege.create({
      data: {
        userId,
        collegeId,
      },
    });

    res.status(201).json({ success: true, message: "College saved successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSavedColleges = async (req, res) => {
  try {
    const userId = String(req.user.id);

    const saved = await prisma.savedCollege.findMany({
      where: { userId },
    });

    res.json({ success: true, count: saved.length, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeSavedCollege = async (req, res) => {
  try {
    const userId = String(req.user.id);
    const collegeId = String(req.params.collegeId);

    await prisma.savedCollege.deleteMany({
      where: { userId, collegeId },
    });

    res.json({ success: true, message: "College removed from saved list" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};