import { Router } from 'express';
import mongoose from 'mongoose';
import Announcement from '../../../models/Announcement.js';
import Club from '../../../models/Club.js';
import ClubRequest from '../../../models/ClubRequest.js';
import Event from '../../../models/Event.js';
import Post from '../../../models/Post.js';
import Report from '../../../models/Report.js';
import { env } from '../../config/env.js';
import { requireAuth, requireRole } from '../../middlewares/auth.middleware.js';
import {
  sendClubPasswordSetupEmail,
  sendClubRequestRejectionEmail,
  sendClubStatusEmail,
  sendClubWarningEmail,
} from '../../utils/email.js';
import { createError } from '../../utils/jwt.js';
import { createRandomToken, hashToken } from '../../utils/tokens.js';

export const adminRouter = Router();
const exportSizeLimit = 5000;
const appealDecisionStatuses = new Set(['upheld', 'overturned', 'modified']);
const appealsStore = [
  {
    id: '1',
    type: 'club-rejection',
    submittedBy: 'AI & ML Club',
    originalDecision: 'Club application rejected due to insufficient faculty advisor commitment and unclear activity plan.',
    evidence: 'Updated advisor confirmation and 6-month activity plan were submitted.',
    submittedAt: '2026-04-25T10:00:00.000Z',
    status: 'pending',
    explanation: '',
  },
  {
    id: '2',
    type: 'moderation-action',
    submittedBy: 'Photography Club',
    originalDecision: 'Club post hidden after student reports.',
    evidence: 'Club says the reported image was part of a supervised workshop announcement.',
    submittedAt: '2026-04-26T14:30:00.000Z',
    status: 'pending',
    explanation: '',
  },
];

function objectIdTimestamp(id) {
  return id?.getTimestamp?.() ?? new Date();
}

function serializeClubRequest(request) {
  return {
    id: String(request._id),
    clubName: request.clubName,
    description: request.description,
    category: request.category,
    representativeName: request.representativeName,
    representativeEmail: request.representativeEmail,
    representativeStudentId: request.representativeStudentId,
    requestedEmail: request.requestedEmail,
    status: request.status,
    adminNote: request.adminNote ?? '',
    submittedAt: objectIdTimestamp(request._id).toISOString(),
    reviewedAt: request.reviewedAt ?? null,
  };
}

function serializeClub(club) {
  return {
    id: String(club._id),
    clubName: club.clubName,
    email: club.email,
    description: club.description,
    category: club.category,
    logoUrl: club.logoUrl ?? null,
    status: club.status,
    suspensionReason: club.suspensionReason ?? '',
    followers: Array.isArray(club.followers) ? club.followers.length : 0,
    approvedAt: club.approvedAt ?? null,
  };
}

function getReportTargetName(report) {
  if (report.targetModel === 'Club') {
    return report.target?.clubName ?? 'Club';
  }

  return report.target?.title ?? report.targetModel;
}

function serializeReport(report) {
  return {
    id: String(report._id),
    targetModel: report.targetModel,
    targetName: getReportTargetName(report),
    reporterName: report.reporter?.fullName ?? 'Student',
    reporterEmail: report.reporter?.email ?? '',
    reason: report.reason,
    description: report.description ?? '',
    status: report.status,
    adminNote: report.adminNote ?? '',
    reviewedAt: report.reviewedAt ?? null,
    createdAt: objectIdTimestamp(report._id).toISOString(),
  };
}

function serializeAnnouncement(announcement) {
  return {
    id: String(announcement._id),
    title: announcement.title,
    message: announcement.message,
    audience: announcement.audience,
    status: announcement.status,
    createdAt: objectIdTimestamp(announcement._id).toISOString(),
  };
}

function normalizeAdminNote(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function parseExportDate(value, fieldName, endOfDay = false) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}`);

  if (Number.isNaN(date.getTime())) {
    throw createError(400, `${fieldName} must be a valid date`);
  }

  return date;
}

function getExportDateRange(query) {
  const from = parseExportDate(query.from, 'Date from');
  const to = parseExportDate(query.to, 'Date to', true);

  if (from && to && from > to) {
    throw createError(400, 'Date from must be before or equal to date to');
  }

  return { from, to };
}

function applyDateRangeFilter(filters, field, range) {
  if (!range.from && !range.to) {
    return filters;
  }

  filters[field] = {};

  if (range.from) {
    filters[field].$gte = range.from;
  }

  if (range.to) {
    filters[field].$lte = range.to;
  }

  return filters;
}

function applyObjectIdDateRangeFilter(filters, range) {
  if (!range.from && !range.to) {
    return filters;
  }

  filters._id = {};

  if (range.from) {
    filters._id.$gte = mongoose.Types.ObjectId.createFromTime(Math.floor(range.from.getTime() / 1000));
  }

  if (range.to) {
    filters._id.$lte = mongoose.Types.ObjectId.createFromTime(Math.floor(range.to.getTime() / 1000));
  }

  return filters;
}

function escapeCsv(value) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

function buildCsv(headers, rows) {
  return [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(',')),
  ].join('\n');
}

function sendCsv(res, filename, headers, rows) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.status(200).send(buildCsv(headers, rows));
}

function serializeAppeal(appeal) {
  return { ...appeal };
}

function findAppeal(appealId) {
  return appealsStore.find((appeal) => appeal.id === String(appealId));
}

function validateAppealIsActionable(appeal) {
  if (appeal.status !== 'pending') {
    throw createError(400, 'Only pending appeals can be reviewed');
  }

  const submittedAt = new Date(appeal.submittedAt);
  const maxAppealAgeMs = 30 * 24 * 60 * 60 * 1000;

  if (Date.now() - submittedAt.getTime() > maxAppealAgeMs) {
    throw createError(400, 'Appeal is outside the allowed review window');
  }

  if (!appeal.originalDecision || !appeal.evidence) {
    throw createError(400, 'Appeal must reference an original decision and evidence');
  }
}

function normalizeModerationAction(value) {
  const action = typeof value === 'string' ? value.trim().toLowerCase() : 'dismiss';

  if (!['dismiss', 'hide', 'remove', 'warn', 'suspend'].includes(action)) {
    throw createError(400, 'Moderation action is invalid');
  }

  return action;
}

function normalizeOptionalText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function buildModerationNote({ action, reasonCategory, warningType, suspensionDurationDays, evidenceReference, adminNote }) {
  const parts = [`Action: ${action}`];

  if (reasonCategory) {
    parts.push(`Reason: ${reasonCategory}`);
  }

  if (warningType) {
    parts.push(`Warning type: ${warningType}`);
  }

  if (suspensionDurationDays) {
    parts.push(`Suspension duration: ${suspensionDurationDays} days`);
  }

  if (evidenceReference) {
    parts.push(`Evidence: ${evidenceReference}`);
  }

  if (adminNote) {
    parts.push(`Note: ${adminNote}`);
  }

  return parts.join('\n');
}

async function getClubIdForReportTarget(report) {
  if (report.targetModel === 'Club') {
    return report.target;
  }

  if (report.targetModel === 'Post') {
    const post = await Post.findById(report.target).select('club').lean();
    return post?.club ?? null;
  }

  if (report.targetModel === 'Event') {
    const event = await Event.findById(report.target).select('club').lean();
    return event?.club ?? null;
  }

  return null;
}

async function sendWarningForReport(report, { warningType, evidenceReference, adminNote }) {
  const clubId = await getClubIdForReportTarget(report);

  if (!clubId) {
    throw createError(404, 'Target club not found for warning');
  }

  const club = await Club.findById(clubId).select('clubName email').lean();

  if (!club) {
    throw createError(404, 'Target club not found for warning');
  }

  return sendClubWarningEmail({
    to: club.email,
    clubName: club.clubName,
    warningType,
    message: adminNote,
    evidenceReference,
  });
}

async function applyModerationAction(report, action, details) {
  const { adminNote } = details;

  if (action === 'dismiss') {
    return;
  }

  if (action === 'warn') {
    await sendWarningForReport(report, details);
    return;
  }

  if (action === 'suspend') {
    const clubId = await getClubIdForReportTarget(report);

    if (!clubId) {
      throw createError(404, 'Target club not found for suspension');
    }

    await Club.findByIdAndUpdate(clubId, {
      $set: {
        status: 'suspended',
        suspensionReason: adminNote || 'Suspended after report moderation',
      },
    });
    return;
  }

  if (report.targetModel === 'Post') {
    await Post.findByIdAndUpdate(report.target, { $set: { status: 'hidden' } });
    return;
  }

  if (report.targetModel === 'Event') {
    await Event.findByIdAndUpdate(report.target, { $set: { status: 'cancelled' } });
    return;
  }

  throw createError(400, `${action} is only available for reported posts or events`);
}

function getPasswordSetupExpiryDate() {
  return new Date(Date.now() + env.passwordSetupExpiresInSeconds * 1000);
}

function ensureObjectId(id, resourceName) {
  if (!mongoose.isValidObjectId(id)) {
    throw createError(404, `${resourceName} not found`);
  }
}

function validateClubStatusTransition(club, nextStatus, suspensionReason) {
  if (club.status === nextStatus) {
    throw createError(400, `Club is already ${nextStatus}`);
  }

  if (nextStatus === 'suspended' && club.status !== 'active') {
    throw createError(400, 'Only active clubs can be suspended');
  }

  if (nextStatus === 'active' && club.status !== 'suspended') {
    throw createError(400, 'Only suspended clubs can be reactivated');
  }

  if (nextStatus === 'suspended' && !suspensionReason) {
    throw createError(400, 'Suspension reason is required');
  }
}

async function notifyClubStatusChange(club, status, reason) {
  try {
    return await sendClubStatusEmail({
      to: club.email,
      clubName: club.clubName,
      status,
      reason,
    });
  } catch (error) {
    console.error('Failed to send club status email', error);
    return { sent: false, delivery: 'failed', recipient: club.email };
  }
}

async function approveClubRequest(request, adminNote) {
  const existingClub = await Club.findOne({
    $or: [
      { clubName: request.clubName },
      { email: request.requestedEmail },
    ],
  }).lean();

  if (existingClub) {
    throw createError(409, 'A club with this name or email already exists');
  }

  const setupToken = createRandomToken();
  const setupExpiresAt = getPasswordSetupExpiryDate();

  const club = await Club.create({
    clubName: request.clubName,
    email: request.requestedEmail,
    passwordHash: null,
    passwordSetupToken: hashToken(setupToken),
    passwordSetupExpires: setupExpiresAt,
    description: request.description,
    category: request.category,
    representativeName: request.representativeName,
    representativeEmail: request.representativeEmail,
    representativeStudentId: request.representativeStudentId,
    createdFromRequest: request._id,
    approvedAt: new Date(),
  });

  request.status = 'approved';
  request.adminNote = adminNote;
  request.reviewedAt = new Date();
  await request.save();

  let emailDelivery = { sent: false, delivery: 'failed' };

  try {
    emailDelivery = await sendClubPasswordSetupEmail({
      to: club.email,
      clubName: club.clubName,
      token: setupToken,
      expiresAt: setupExpiresAt,
    });
  } catch (error) {
    console.error('Failed to send club password setup email', error);
  }

  return { club, emailDelivery };
}

async function rejectClubRequest(request, adminNote) {
  request.status = 'rejected';
  request.adminNote = adminNote;
  request.reviewedAt = new Date();
  await request.save();

  let emailDelivery = { sent: false, delivery: 'failed', recipients: [] };

  try {
    emailDelivery = await sendClubRequestRejectionEmail({
      to: [request.representativeEmail, request.requestedEmail],
      clubName: request.clubName,
      representativeName: request.representativeName,
      adminNote,
    });
  } catch (error) {
    console.error('Failed to send club request rejection email', error);
  }

  return { emailDelivery };
}

adminRouter.get('/club-requests', requireAuth, requireRole('admin'), async (_req, res, next) => {
  try {
    const requests = await ClubRequest.find()
      .sort({ _id: -1 })
      .limit(100)
      .lean();

    res.status(200).json({
      requests: requests.map(serializeClubRequest),
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/dashboard', requireAuth, requireRole('admin'), async (_req, res, next) => {
  try {
    const now = new Date();
    const [
      totalClubs,
      pendingApprovals,
      activeEvents,
      openReports,
      recentRequests,
      recentReports,
      activeClubs,
    ] = await Promise.all([
      Club.countDocuments(),
      ClubRequest.countDocuments({ status: 'pending' }),
      Event.countDocuments({ status: 'published', endDateTime: { $gte: now } }),
      Report.countDocuments({ status: 'pending' }),
      ClubRequest.find({ status: 'pending' }).sort({ _id: -1 }).limit(3).lean(),
      Report.find({ status: 'pending' })
        .populate('reporter', 'fullName email')
        .populate('target')
        .sort({ _id: -1 })
        .limit(5)
        .lean(),
      Club.find({ status: 'active' })
        .select('clubName email description category logoUrl status followers approvedAt')
        .sort({ approvedAt: -1, _id: -1 })
        .limit(5)
        .lean(),
    ]);

    res.status(200).json({
      stats: {
        totalClubs,
        pendingApprovals,
        activeEvents,
        openReports,
      },
      recentRequests: recentRequests.map(serializeClubRequest),
      recentReports: recentReports.map(serializeReport),
      activeClubs: activeClubs.map(serializeClub),
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/clubs', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const filters = {};

    if (search) {
      filters.clubName = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    }

    const clubs = await Club.find(filters)
      .select('clubName email description category logoUrl status suspensionReason followers approvedAt')
      .sort({ clubName: 1 })
      .limit(100)
      .lean();

    res.status(200).json({
      clubs: clubs.map(serializeClub),
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch('/clubs/:clubId/status', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    ensureObjectId(req.params.clubId, 'Club');

    const status = typeof req.body?.status === 'string' ? req.body.status.trim().toLowerCase() : '';
    const suspensionReason = normalizeAdminNote(req.body?.suspensionReason);

    if (!['active', 'suspended'].includes(status)) {
      throw createError(400, 'Status must be active or suspended');
    }

    const existingClub = await Club.findById(req.params.clubId);

    if (!existingClub) {
      throw createError(404, 'Club not found');
    }

    validateClubStatusTransition(existingClub, status, suspensionReason);

    existingClub.status = status;

    if (status === 'suspended') {
      existingClub.suspensionReason = suspensionReason;
    } else {
      existingClub.suspensionReason = undefined;
    }

    await existingClub.save();

    const emailDelivery = await notifyClubStatusChange(existingClub, status, suspensionReason);

    res.status(200).json({
      message: 'Club status updated',
      club: serializeClub(existingClub.toObject()),
      emailDelivery,
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/reports', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status.trim().toLowerCase() : 'all';
    const filters = {};

    if (status !== 'all') {
      filters.status = status;
    }

    const reports = await Report.find(filters)
      .populate('reporter', 'fullName email')
      .populate('target')
      .sort({ _id: -1 })
      .limit(100)
      .lean();

    res.status(200).json({
      reports: reports.map(serializeReport),
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/appeals', requireAuth, requireRole('admin'), async (_req, res) => {
  const appeals = [...appealsStore]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .map(serializeAppeal);

  res.status(200).json({ appeals });
});

adminRouter.get('/appeals/:appealId', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const appeal = findAppeal(req.params.appealId);

    if (!appeal) {
      throw createError(404, 'Appeal not found');
    }

    res.status(200).json({ appeal: serializeAppeal(appeal) });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch('/appeals/:appealId', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const appeal = findAppeal(req.params.appealId);
    const decision = typeof req.body?.decision === 'string' ? req.body.decision.trim().toLowerCase() : '';
    const explanation = normalizeAdminNote(req.body?.explanation);

    if (!appeal) {
      throw createError(404, 'Appeal not found');
    }

    if (!appealDecisionStatuses.has(decision)) {
      throw createError(400, 'Decision must be upheld, overturned, or modified');
    }

    if (!explanation) {
      throw createError(400, 'Decision explanation is required');
    }

    validateAppealIsActionable(appeal);

    appeal.status = decision;
    appeal.explanation = explanation;
    appeal.reviewedAt = new Date().toISOString();
    appeal.reviewedBy = String(req.user._id);

    console.log(`Admin ${req.user._id} reviewed appeal ${appeal.id}: ${decision}`);

    res.status(200).json({
      message: 'Appeal reviewed',
      appeal: serializeAppeal(appeal),
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/exports/:type', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const type = typeof req.params.type === 'string' ? req.params.type.trim().toLowerCase() : '';
    const format = typeof req.query.format === 'string' ? req.query.format.trim().toLowerCase() : 'csv';
    const range = getExportDateRange(req.query);

    if (format !== 'csv') {
      throw createError(400, 'Only CSV export is currently supported');
    }

    if (!['clubs', 'events', 'reports'].includes(type)) {
      throw createError(400, 'Export type must be clubs, events, or reports');
    }

    if (type === 'clubs') {
      const filters = applyDateRangeFilter({}, 'approvedAt', range);
      const count = await Club.countDocuments(filters);

      if (count > exportSizeLimit) {
        throw createError(413, `Export contains ${count} rows. Narrow filters below ${exportSizeLimit} rows.`);
      }

      const clubs = await Club.find(filters)
        .select('clubName email category status followers approvedAt suspensionReason')
        .sort({ clubName: 1 })
        .lean();
      const headers = ['Club Name', 'Email', 'Category', 'Status', 'Followers', 'Approved At', 'Suspension Reason'];
      const rows = clubs.map((club) => ({
        'Club Name': club.clubName,
        Email: club.email,
        Category: club.category,
        Status: club.status,
        Followers: Array.isArray(club.followers) ? club.followers.length : 0,
        'Approved At': club.approvedAt ? club.approvedAt.toISOString() : '',
        'Suspension Reason': club.suspensionReason ?? '',
      }));

      console.log(`Admin ${req.user._id} exported clubs CSV (${rows.length} rows)`);
      sendCsv(res, `kmultaqa-clubs-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
      return;
    }

    if (type === 'events') {
      const filters = applyDateRangeFilter({}, 'startDateTime', range);
      const count = await Event.countDocuments(filters);

      if (count > exportSizeLimit) {
        throw createError(413, `Export contains ${count} rows. Narrow filters below ${exportSizeLimit} rows.`);
      }

      const events = await Event.find(filters)
        .populate('club', 'clubName')
        .select('title category startDateTime endDateTime location capacity status club')
        .sort({ startDateTime: 1 })
        .lean();
      const headers = ['Title', 'Club', 'Category', 'Start', 'End', 'Location', 'Capacity', 'Status'];
      const rows = events.map((event) => ({
        Title: event.title,
        Club: event.club?.clubName ?? '',
        Category: event.category,
        Start: event.startDateTime ? event.startDateTime.toISOString() : '',
        End: event.endDateTime ? event.endDateTime.toISOString() : '',
        Location: event.location ?? '',
        Capacity: event.capacity ?? '',
        Status: event.status,
      }));

      console.log(`Admin ${req.user._id} exported events CSV (${rows.length} rows)`);
      sendCsv(res, `kmultaqa-events-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
      return;
    }

    const status = typeof req.query.status === 'string' ? req.query.status.trim().toLowerCase() : 'all';
    const filters = applyObjectIdDateRangeFilter({}, range);

    if (status !== 'all') {
      if (!['pending', 'resolved', 'dismissed'].includes(status)) {
        throw createError(400, 'Report status filter is invalid');
      }

      filters.status = status;
    }

    const count = await Report.countDocuments(filters);

    if (count > exportSizeLimit) {
      throw createError(413, `Export contains ${count} rows. Narrow filters below ${exportSizeLimit} rows.`);
    }

    const reportsQuery = Report.find(filters)
      .populate('reporter', 'fullName email')
      .populate('target')
      .sort({ _id: -1 });
    const reports = await reportsQuery.lean();

    const headers = ['Target Type', 'Target', 'Reason', 'Reporter', 'Reporter Email', 'Status', 'Created At', 'Reviewed At', 'Admin Note'];
    const rows = reports.map((report) => ({
      'Target Type': report.targetModel,
      Target: getReportTargetName(report),
      Reason: report.reason,
      Reporter: report.reporter?.fullName ?? '',
      'Reporter Email': report.reporter?.email ?? '',
      Status: report.status,
      'Created At': objectIdTimestamp(report._id).toISOString(),
      'Reviewed At': report.reviewedAt ? report.reviewedAt.toISOString() : '',
      'Admin Note': report.adminNote ?? '',
    }));

    console.log(`Admin ${req.user._id} exported reports CSV (${rows.length} rows)`);
    sendCsv(res, `kmultaqa-reports-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  } catch (error) {
    next(error);
  }
});

adminRouter.patch('/reports/:reportId', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    ensureObjectId(req.params.reportId, 'Report');

    const status = typeof req.body?.status === 'string' ? req.body.status.trim().toLowerCase() : '';
    const action = normalizeModerationAction(req.body?.moderationAction);
    const reasonCategory = normalizeOptionalText(req.body?.reasonCategory);
    const warningType = normalizeOptionalText(req.body?.warningType);
    const evidenceReference = normalizeOptionalText(req.body?.evidenceReference);
    const adminNote = normalizeAdminNote(req.body?.adminNote);
    const suspensionDurationDays = req.body?.suspensionDurationDays
      ? Number(req.body.suspensionDurationDays)
      : null;

    if (!['resolved', 'dismissed'].includes(status)) {
      throw createError(400, 'Status must be resolved or dismissed');
    }

    if (status === 'dismissed' && action !== 'dismiss') {
      throw createError(400, 'Dismissed reports must use the dismiss action');
    }

    if (status === 'resolved' && action === 'dismiss') {
      throw createError(400, 'Resolved reports require a moderation action');
    }

    if (['hide', 'remove'].includes(action) && !reasonCategory) {
      throw createError(400, 'Reason category is required for hide/remove actions');
    }

    if (action === 'warn' && (!warningType || !adminNote)) {
      throw createError(400, 'Warning type and message are required');
    }

    if (action === 'suspend') {
      if (!adminNote) {
        throw createError(400, 'Suspension reason is required');
      }

      if (!Number.isInteger(suspensionDurationDays) || suspensionDurationDays < 1) {
        throw createError(400, 'Suspension duration must be a positive whole number');
      }
    }

    const report = await Report.findById(req.params.reportId);

    if (!report) {
      throw createError(404, 'Report not found');
    }

    if (report.status !== 'pending') {
      throw createError(400, 'Only pending reports can be moderated');
    }

    await applyModerationAction(report, action, {
      adminNote,
      warningType,
      evidenceReference,
    });

    report.status = status;
    report.adminNote = buildModerationNote({
      action,
      reasonCategory,
      warningType,
      suspensionDurationDays,
      evidenceReference,
      adminNote,
    });
    report.reviewedAt = new Date();
    await report.save();

    const updatedReport = await Report.findById(report._id)
      .populate('reporter', 'fullName email')
      .populate('target')
      .lean();

    res.status(200).json({
      message: 'Report updated',
      report: serializeReport(updatedReport),
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/announcements', requireAuth, requireRole('admin'), async (_req, res, next) => {
  try {
    const announcements = await Announcement.find()
      .sort({ _id: -1 })
      .limit(20)
      .lean();

    res.status(200).json({
      announcements: announcements.map(serializeAnnouncement),
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.post('/announcements', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
    const audience = typeof req.body?.audience === 'string' ? req.body.audience.trim() : 'all';

    if (title.length < 8 || title.length > 120) {
      throw createError(400, 'Title must be between 8 and 120 characters');
    }

    if (message.length < 20 || message.length > 2000) {
      throw createError(400, 'Content must be between 20 and 2000 characters');
    }

    if (!['all', 'students', 'clubs'].includes(audience)) {
      throw createError(400, 'Audience is invalid');
    }

    const announcement = await Announcement.create({
      title,
      message,
      audience,
      status: 'active',
    });

    res.status(201).json({
      message: 'Announcement published',
      announcement: serializeAnnouncement(announcement),
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch('/club-requests/:requestId', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const status = typeof req.body?.status === 'string' ? req.body.status.trim().toLowerCase() : '';
    const adminNote = normalizeAdminNote(req.body?.adminNote);

    if (!['approved', 'rejected'].includes(status)) {
      throw createError(400, 'Status must be approved or rejected');
    }

    if (status === 'rejected' && !adminNote) {
      throw createError(400, 'Rejection note is required');
    }

    const request = await ClubRequest.findById(req.params.requestId);

    if (!request) {
      throw createError(404, 'Club request not found');
    }

    if (request.status !== 'pending') {
      throw createError(400, 'Only pending requests can be reviewed');
    }

    let emailDelivery = null;

    if (status === 'approved') {
      const result = await approveClubRequest(request, adminNote);
      emailDelivery = result.emailDelivery;
    } else {
      const result = await rejectClubRequest(request, adminNote);
      emailDelivery = result.emailDelivery;
    }

    res.status(200).json({
      message:
        status === 'approved'
          ? 'Club request approved'
          : 'Club request rejected',
      request: serializeClubRequest(request),
      emailDelivery,
    });
  } catch (error) {
    if (error?.code === 11000) {
      next(createError(409, 'A club with this name or email already exists'));
      return;
    }

    next(error);
  }
});
