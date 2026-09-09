import { db } from "../database/db.js";
import { leadsTable } from "../models/lead.schema.js";
import { eq, desc } from "drizzle-orm";

export const createLead = async (data) => {
  // Deduplication Check
  const existing = await db
    .select()
    .from(leadsTable)
    .where(eq(leadsTable.phone, data.phone));

  if (existing.length > 0) {
    const prevLead = existing[0];
    const history = Array.isArray(prevLead.activityHistory) ? prevLead.activityHistory : [];

    const newActivity = {
      action: "ENQUIRY_RESUBMITTED",
      message: data.message || "Student resubmitted enquiry form",
      course: data.course || prevLead.course,
      college: data.college || prevLead.college,
      timestamp: new Date().toISOString(),
    };

    // Update existing lead (Merge data)
    await db
      .update(leadsTable)
      .set({
        name: data.name || prevLead.name,
        email: data.email || prevLead.email,
        state: data.state || prevLead.state,
        city: data.city || prevLead.city,
        course: data.course || prevLead.course,
        college: data.college || prevLead.college,
        message: data.message ? `${prevLead.message || ''}\n[Update]: ${data.message}` : prevLead.message,
        activityHistory: [...history, newActivity],
      })
      .where(eq(leadsTable.id, prevLead.id));

    const [updated] = await db.select().from(leadsTable).where(eq(leadsTable.id, prevLead.id));
    return updated;
  }

  // Create New Lead
  const initialActivity = [
    {
      action: "LEAD_CREATED",
      message: data.message || "Initial Enquiry Received",
      timestamp: new Date().toISOString(),
    },
  ];

  await db.insert(leadsTable).values({
    ...data,
    status: "NEW",
    score: 50,
    activityHistory: initialActivity,
  });

  const [createdLead] = await db
    .select()
    .from(leadsTable)
    .where(eq(leadsTable.phone, data.phone));

  return createdLead;
};

export const getLeads = async () => {
  return await db.select().from(leadsTable).orderBy(desc(leadsTable.createdAt));
};

export const updateLeadStatusService = async (id, status) => {
  const [existing] = await db.select().from(leadsTable).where(eq(leadsTable.id, id));
  if (!existing) throw new Error("Lead not found");

  const history = Array.isArray(existing.activityHistory) ? existing.activityHistory : [];
  const statusLog = {
    action: "STATUS_CHANGE",
    from: existing.status,
    to: status,
    timestamp: new Date().toISOString(),
  };

  await db
    .update(leadsTable)
    .set({
      status,
      activityHistory: [...history, statusLog],
    })
    .where(eq(leadsTable.id, id));

  return true;
};

export const assignCounsellorService = async (id, { counsellorId, counsellorName }) => {
  const [existing] = await db.select().from(leadsTable).where(eq(leadsTable.id, id));
  if (!existing) throw new Error("Lead not found");

  const history = Array.isArray(existing.activityHistory) ? existing.activityHistory : [];
  const assignLog = {
    action: "COUNSELLOR_ASSIGNED",
    counsellorName,
    timestamp: new Date().toISOString(),
  };

  await db
    .update(leadsTable)
    .set({
      counsellorId,
      counsellorName,
      activityHistory: [...history, assignLog],
    })
    .where(eq(leadsTable.id, id));

  return true;
};

export const addFollowUpService = async (id, { followUpDate, notes }) => {
  const [existing] = await db.select().from(leadsTable).where(eq(leadsTable.id, id));
  if (!existing) throw new Error("Lead not found");

  const history = Array.isArray(existing.activityHistory) ? existing.activityHistory : [];
  const followUpLog = {
    action: "FOLLOW_UP_SCHEDULED",
    followUpDate,
    notes,
    timestamp: new Date().toISOString(),
  };

  await db
    .update(leadsTable)
    .set({
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      followUpNotes: notes,
      activityHistory: [...history, followUpLog],
    })
    .where(eq(leadsTable.id, id));

  return true;
};

export const deleteLead = async (id) => {
  return await db.delete(leadsTable).where(eq(leadsTable.id, id));
};
