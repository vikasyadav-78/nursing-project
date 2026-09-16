import { prisma } from "../database/prisma.js";

export const createLead = async (data) => {
  // Deduplication Check
  const prevLead = await prisma.lead.findFirst({
    where: { phone: data.phone },
  });

  if (prevLead) {
    const history = Array.isArray(prevLead.activityHistory) ? prevLead.activityHistory : [];

    const newActivity = {
      action: "ENQUIRY_RESUBMITTED",
      message: data.message || "Student resubmitted enquiry form",
      course: data.course || prevLead.course,
      college: data.college || prevLead.college,
      timestamp: new Date().toISOString(),
    };

    // Update existing lead (Merge data)
    const updated = await prisma.lead.update({
      where: { id: prevLead.id },
      data: {
        name: data.name || prevLead.name,
        email: data.email || prevLead.email,
        state: data.state || prevLead.state,
        city: data.city || prevLead.city,
        course: data.course || prevLead.course,
        college: data.college || prevLead.college,
        message: data.message ? `${prevLead.message || ""}\n[Update]: ${data.message}` : prevLead.message,
        activityHistory: [...history, newActivity],
      },
    });

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

  const createdLead = await prisma.lead.create({
    data: {
      ...data,
      status: "NEW",
      score: 50,
      activityHistory: initialActivity,
    },
  });

  return createdLead;
};

export const getLeads = async () => {
  return await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
  });
};

export const updateLeadStatusService = async (id, status) => {
  const existing = await prisma.lead.findUnique({ where: { id } });
  if (!existing) throw new Error("Lead not found");

  const history = Array.isArray(existing.activityHistory) ? existing.activityHistory : [];
  const statusLog = {
    action: "STATUS_CHANGE",
    from: existing.status,
    to: status,
    timestamp: new Date().toISOString(),
  };

  await prisma.lead.update({
    where: { id },
    data: {
      status,
      activityHistory: [...history, statusLog],
    },
  });

  return true;
};

export const assignCounsellorService = async (id, { counsellorId, counsellorName }) => {
  const existing = await prisma.lead.findUnique({ where: { id } });
  if (!existing) throw new Error("Lead not found");

  const history = Array.isArray(existing.activityHistory) ? existing.activityHistory : [];
  const assignLog = {
    action: "COUNSELLOR_ASSIGNED",
    counsellorName,
    timestamp: new Date().toISOString(),
  };

  await prisma.lead.update({
    where: { id },
    data: {
      counsellorId,
      counsellorName,
      activityHistory: [...history, assignLog],
    },
  });

  return true;
};

export const addFollowUpService = async (id, { followUpDate, notes }) => {
  const existing = await prisma.lead.findUnique({ where: { id } });
  if (!existing) throw new Error("Lead not found");

  const history = Array.isArray(existing.activityHistory) ? existing.activityHistory : [];
  const followUpLog = {
    action: "FOLLOW_UP_SCHEDULED",
    followUpDate,
    notes,
    timestamp: new Date().toISOString(),
  };

  await prisma.lead.update({
    where: { id },
    data: {
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      followUpNotes: notes,
      activityHistory: [...history, followUpLog],
    },
  });

  return true;
};

export const deleteLead = async (id) => {
  return await prisma.lead.delete({
    where: { id },
  });
};
