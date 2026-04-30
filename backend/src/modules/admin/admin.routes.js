import { Router } from 'express';
import mongoose from 'mongoose';
import Announcement from '../../../models/Announcement.js';
import Club from '../../../models/Club.js';
import ClubRequest from '../../../models/ClubRequest.js';
import Event from '../../../models/Event.js';
import Report from '../../../models/Report.js';
import { env } from '../../config/env.js';
import { requireAuth, requireRole } from '../../middlewares/auth.middleware.js';
import { sendClubPasswordSetupEmail, sendClubRequestRejectionEmail } from '../../utils/email.js';
import { createError } from '../../utils/jwt.js';
import { createRandomToken, hashToken } from '../../utils/tokens.js';

export const adminRouter = Router();

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

function getPasswordSetupExpiryDate() {
  return new Date(Date.now() + env.passwordSetupExpiresInSeconds * 1000);
}

function ensureObjectId(id, resourceName) {
  if (!mongoose.isValidObjectId(id)) {
    throw createError(404, `${resourceName} not found`);
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

    if (status === 'suspended' && !suspensionReason) {
      throw createError(400, 'Suspension reason is required');
    }

    const update =
      status === 'suspended'
        ? { $set: { status, suspensionReason } }
        : { $set: { status }, $unset: { suspensionReason: '' } };

    const club = await Club.findByIdAndUpdate(req.params.clubId, update, {
      new: true,
      runValidators: true,
    }).lean();

    if (!club) {
      throw createError(404, 'Club not found');
    }

    res.status(200).json({
      message: 'Club status updated',
      club: serializeClub(club),
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

adminRouter.patch('/reports/:reportId', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    ensureObjectId(req.params.reportId, 'Report');

    const status = typeof req.body?.status === 'string' ? req.body.status.trim().toLowerCase() : '';
    const adminNote = normalizeAdminNote(req.body?.adminNote);

    if (!['resolved', 'dismissed'].includes(status)) {
      throw createError(400, 'Status must be resolved or dismissed');
    }

    const report = await Report.findByIdAndUpdate(
      req.params.reportId,
      {
        status,
        adminNote,
        reviewedAt: new Date(),
      },
      { new: true, runValidators: true }
    )
      .populate('reporter', 'fullName email')
      .populate('target')
      .lean();

    if (!report) {
      throw createError(404, 'Report not found');
    }

    res.status(200).json({
      message: 'Report updated',
      report: serializeReport(report),
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
