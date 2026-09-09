import { db } from "../database/db.js";
import { usersTable } from "../models/user.schema.js";
import { savedCollegesTable } from "../models/savedCollege.schema.js";
import { collegesTable } from "../models/college.schema.js";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { createAuditLog } from "../services/audit.service.js";

export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [user] = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        email: usersTable.email,
        role: usersTable.role,
        mobile: usersTable.mobile,
        location: usersTable.location,
        educationLevel: usersTable.educationLevel,
        coursePreferences: usersTable.coursePreferences,
        examPreferences: usersTable.examPreferences,
        budget: usersTable.budget,
        careerInterests: usersTable.careerInterests,
        isActive: usersTable.isActive,
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId));

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
    const userId = req.user.id;
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

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));

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
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (username) updateData.username = username;
    if (email) updateData.email = email;
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

    await db
      .update(usersTable)
      .set(updateData)
      .where(eq(usersTable.id, userId));

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
    const userId = req.user.id;
    const { collegeId } = req.body;

    if (!collegeId) {
      return res.status(400).json({ success: false, message: "College ID is required" });
    }

    const existing = await db
      .select()
      .from(savedCollegesTable)
      .where(and(eq(savedCollegesTable.userId, userId), eq(savedCollegesTable.collegeId, collegeId)));

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: "College is already saved" });
    }

    await db.insert(savedCollegesTable).values({
      userId,
      collegeId,
    });

    res.status(201).json({ success: true, message: "College saved successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSavedColleges = async (req, res) => {
  try {
    const userId = req.user.id;

    const saved = await db
      .select({
        savedId: savedCollegesTable.id,
        savedAt: savedCollegesTable.createdAt,
        college: collegesTable,
      })
      .from(savedCollegesTable)
      .innerJoin(collegesTable, eq(savedCollegesTable.collegeId, collegesTable.id))
      .where(eq(savedCollegesTable.userId, userId));

    res.json({ success: true, count: saved.length, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeSavedCollege = async (req, res) => {
  try {
    const userId = req.user.id;
    const { collegeId } = req.params;

    await db
      .delete(savedCollegesTable)
      .where(and(eq(savedCollegesTable.userId, userId), eq(savedCollegesTable.collegeId, collegeId)));

    res.json({ success: true, message: "College removed from saved list" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};