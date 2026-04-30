import { Router } from 'express';
import mongoose from 'mongoose';
import { requireAuth, requireRole } from '../../middlewares/auth.middleware.js';
import Announcement from '../../../models/Announcement.js';
import Event from '../../../models/Event.js';
import EventRegistration from '../../../models/EventRegistration.js';
import Club from '../../../models/Club.js';
import Post from '../../../models/Post.js';
import Report from '../../../models/Report.js';
import Student from '../../../models/Student.js';
import { createError } from '../../utils/jwt.js';

export const studentRouter = Router();

function objectIdTimestamp(id) {
  return id?.getTimestamp?.() ?? new Date();
}

function serializeClub(club) {
  return {
    id: String(club._id),
    clubName: club.clubName,
    description: club.description,
    logoUrl: club.logoUrl ?? null,
    category: club.category,
    status: club.status,
    followers: Array.isArray(club.followers) ? club.followers.length : 0,
  };
}

function normalizeGlobalEmailPreference(value) {
  return value === 'off' ? 'off' : 'on';
}

function getClubPreference(student, clubId) {
  const preference = student.notificationPreferences?.clubs?.find((item) => {
    return String(item.club?._id ?? item.club) === String(clubId);
  });

  return {
    email: preference?.email !== false,
    inApp: preference?.inApp !== false,
  };
}

function serializeStudentSettings(student) {
  const followedClubs = (student.followedClubs ?? []).filter(Boolean);

  return {
    student: {
      email: student.email,
      isVerified: Boolean(student.isVerified),
    },
    globalSettings: {
      email: normalizeGlobalEmailPreference(student.notificationPreferences?.email),
    },
    followedClubs: followedClubs.map((club) => {
      const preferences = getClubPreference(student, club._id);

      return {
        id: String(club._id),
        clubName: club.clubName,
        logoUrl: club.logoUrl ?? null,
        category: club.category,
        email: preferences.email,
        inApp: preferences.inApp,
      };
    }),
  };
}

function getRequestedClubSettings(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return {};
  }

  return input;
}

function serializePost(post) {
  return {
    id: String(post._id),
    type: 'post',
    clubId: String(post.club?._id ?? post.club),
    clubName: post.club?.clubName ?? 'Club',
    clubLogoUrl: post.club?.logoUrl ?? null,
    title: post.title,
    content: post.content,
    imageUrl: post.imageUrl ?? null,
    isPinned: Boolean(post.isPinned),
    createdAt: objectIdTimestamp(post._id).toISOString(),
  };
}

function serializeEvent(event, registeredCount) {
  return {
    id: String(event._id),
    type: 'event',
    clubId: String(event.club?._id ?? event.club),
    clubName: event.club?.clubName ?? 'Club',
    clubLogoUrl: event.club?.logoUrl ?? null,
    title: event.title,
    content: event.description,
    category: event.category,
    startDateTime: event.startDateTime,
    endDateTime: event.endDateTime,
    location: event.location ?? '',
    capacity: event.capacity ?? null,
    registered: registeredCount,
    imageUrl: event.imageUrl ?? null,
    createdAt: objectIdTimestamp(event._id).toISOString(),
  };
}

function serializeAnnouncement(announcement) {
  return {
    id: String(announcement._id),
    title: announcement.title,
    message: announcement.message,
    audience: announcement.audience,
    createdAt: objectIdTimestamp(announcement._id).toISOString(),
  };
}

function serializeRegistrationField(field) {
  return {
    label: field.label,
    fieldType: field.fieldType,
    required: Boolean(field.required),
    options: field.options ?? [],
  };
}

function serializeEventDetail(event, registeredCount, isRegistered) {
  return {
    ...serializeEvent(event, registeredCount),
    description: event.description,
    registrationFields: (event.registrationFields ?? []).map(serializeRegistrationField),
    isRegistered,
    club: {
      id: String(event.club?._id ?? event.club),
      clubName: event.club?.clubName ?? 'Club',
      logoUrl: event.club?.logoUrl ?? null,
    },
  };
}

function getRegistrationStatus(event, registrationStatus) {
  if (registrationStatus === 'cancelled' || event.status === 'cancelled') {
    return 'cancelled';
  }

  if (event.endDateTime && new Date(event.endDateTime).getTime() < Date.now()) {
    return 'past';
  }

  return 'upcoming';
}

function serializeRegisteredEvent(registration) {
  const event = registration.event;

  return {
    id: String(event._id),
    registrationId: String(registration._id),
    title: event.title,
    club: event.club?.clubName ?? 'Club',
    clubId: String(event.club?._id ?? event.club),
    clubLogoUrl: event.club?.logoUrl ?? null,
    startDateTime: event.startDateTime,
    endDateTime: event.endDateTime,
    location: event.location ?? '',
    capacity: event.capacity ?? null,
    status: getRegistrationStatus(event, registration.status),
    imageUrl: event.imageUrl ?? null,
  };
}

function normalizeAnswers(answers) {
  if (!Array.isArray(answers)) {
    return [];
  }

  return answers
    .map((answer) => ({
      fieldLabel: typeof answer.fieldLabel === 'string' ? answer.fieldLabel.trim() : '',
      answer: typeof answer.answer === 'string' ? answer.answer.trim() : '',
    }))
    .filter((answer) => answer.fieldLabel && answer.answer);
}

function validateRegistrationAnswers(event, answers) {
  const answersByLabel = new Map(answers.map((answer) => [answer.fieldLabel, answer.answer]));

  for (const field of event.registrationFields ?? []) {
    const value = answersByLabel.get(field.label);

    if (field.required && !value) {
      return `${field.label} is required`;
    }

    if (field.fieldType === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return `${field.label} must be a valid email address`;
    }
  }

  return null;
}

function normalizeReportInput(input) {
  const targetModel = typeof input?.targetModel === 'string' ? input.targetModel.trim() : '';
  const targetId = typeof input?.targetId === 'string' ? input.targetId.trim() : '';
  const reason = typeof input?.reason === 'string' ? input.reason.trim() : '';
  const description = typeof input?.description === 'string' ? input.description.trim() : '';

  if (!['Post', 'Event', 'Club'].includes(targetModel)) {
    throw createError(400, 'Report target type is invalid');
  }

  if (!mongoose.isValidObjectId(targetId)) {
    throw createError(404, 'Report target not found');
  }

  if (!reason) {
    throw createError(400, 'Report reason is required');
  }

  return {
    targetModel,
    targetId,
    reason,
    description,
  };
}

async function findReportTarget(targetModel, targetId) {
  if (targetModel === 'Post') {
    return Post.findOne({ _id: targetId, status: 'active' }).select('_id').lean();
  }

  if (targetModel === 'Event') {
    return Event.findOne({ _id: targetId, status: { $ne: 'draft' } }).select('_id').lean();
  }

  return Club.findOne({ _id: targetId, status: 'active' }).select('_id').lean();
}

studentRouter.get('/settings', requireAuth, requireRole('student'), async (req, res, next) => {
  try {
    const student = await Student.findById(req.user._id)
      .select('email isVerified followedClubs notificationPreferences')
      .populate({
        path: 'followedClubs',
        match: { status: 'active' },
        select: 'clubName logoUrl category',
      });

    res.status(200).json(serializeStudentSettings(student));
  } catch (error) {
    next(error);
  }
});

studentRouter.patch('/settings', requireAuth, requireRole('student'), async (req, res, next) => {
  try {
    const student = await Student.findById(req.user._id).select('followedClubs notificationPreferences');
    const followedClubIds = (student.followedClubs ?? []).map((id) => String(id));
    const requestedClubSettings = getRequestedClubSettings(req.body?.clubSettings);

    student.notificationPreferences = {
      email: normalizeGlobalEmailPreference(req.body?.globalSettings?.email),
      clubs: followedClubIds.map((clubId) => {
        const existing = getClubPreference(student, clubId);
        const requested = requestedClubSettings[clubId] ?? {};

        return {
          club: clubId,
          email: typeof requested.email === 'boolean' ? requested.email : existing.email,
          inApp: typeof requested.inApp === 'boolean' ? requested.inApp : existing.inApp,
        };
      }),
    };

    await student.save();
    await student.populate({
      path: 'followedClubs',
      match: { status: 'active' },
      select: 'clubName logoUrl category',
    });

    res.status(200).json({
      message: 'Notification settings saved',
      ...serializeStudentSettings(student),
    });
  } catch (error) {
    next(error);
  }
});

studentRouter.get('/dashboard', requireAuth, requireRole('student'), async (req, res, next) => {
  try {
    const student = await Student.findById(req.user._id)
      .populate({
        path: 'followedClubs',
        match: { status: 'active' },
        select: 'clubName logoUrl category followers',
      })
      .lean();

    const followedClubs = (student?.followedClubs ?? []).filter(Boolean);
    const followedClubIds = followedClubs.map((club) => club._id);
    const announcementsPromise = Announcement.find({
      status: 'active',
      audience: { $in: ['all', 'students'] },
    })
      .sort({ _id: -1 })
      .limit(5)
      .lean();

    if (followedClubIds.length === 0) {
      const announcements = await announcementsPromise;

      res.status(200).json({
        followedClubs: [],
        feed: [],
        announcements: announcements.map(serializeAnnouncement),
      });
      return;
    }

    const [posts, events, announcements] = await Promise.all([
      Post.find({
        club: { $in: followedClubIds },
        status: 'active',
      })
        .populate('club', 'clubName logoUrl')
        .sort({ _id: -1 })
        .limit(50)
        .lean(),
      Event.find({
        club: { $in: followedClubIds },
        status: 'published',
      })
        .populate('club', 'clubName logoUrl')
        .sort({ startDateTime: 1 })
        .limit(50)
        .lean(),
      announcementsPromise,
    ]);

    const eventIds = events.map((event) => event._id);
    const registrationCounts = eventIds.length
      ? await EventRegistration.aggregate([
          {
            $match: {
              event: { $in: eventIds },
              status: 'registered',
            },
          },
          {
            $group: {
              _id: '$event',
              count: { $sum: 1 },
            },
          },
        ])
      : [];
    const registrationCountByEventId = new Map(
      registrationCounts.map((item) => [String(item._id), item.count])
    );

    const feed = [
      ...posts.map(serializePost),
      ...events.map((event) =>
        serializeEvent(event, registrationCountByEventId.get(String(event._id)) ?? 0)
      ),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.status(200).json({
      followedClubs: followedClubs.map(serializeClub),
      feed,
      announcements: announcements.map(serializeAnnouncement),
    });
  } catch (error) {
    next(error);
  }
});

studentRouter.post('/reports', requireAuth, requireRole('student'), async (req, res, next) => {
  try {
    const payload = normalizeReportInput(req.body);
    const target = await findReportTarget(payload.targetModel, payload.targetId);

    if (!target) {
      throw createError(404, 'Report target not found');
    }

    const existingPendingReport = await Report.findOne({
      reporter: req.user._id,
      target: payload.targetId,
      targetModel: payload.targetModel,
      status: 'pending',
    }).lean();

    if (existingPendingReport) {
      throw createError(409, 'You already have a pending report for this item');
    }

    await Report.create({
      reporter: req.user._id,
      target: payload.targetId,
      targetModel: payload.targetModel,
      reason: payload.reason,
      description: payload.description,
    });

    res.status(201).json({
      message: 'Report submitted for admin review',
    });
  } catch (error) {
    next(error);
  }
});

studentRouter.get('/events/registrations', requireAuth, requireRole('student'), async (req, res, next) => {
  try {
    const registrations = await EventRegistration.find({
      student: req.user._id,
      status: 'registered',
    })
      .populate({
        path: 'event',
        match: { status: { $ne: 'draft' } },
        populate: {
          path: 'club',
          select: 'clubName logoUrl',
        },
      })
      .sort({ _id: -1 })
      .lean();

    res.status(200).json({
      events: registrations
        .filter((registration) => registration.event)
        .map(serializeRegisteredEvent),
    });
  } catch (error) {
    next(error);
  }
});

studentRouter.get('/events/:eventId', requireAuth, requireRole('student'), async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.eventId)) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    const event = await Event.findOne({
      _id: req.params.eventId,
      status: { $ne: 'draft' },
    })
      .populate('club', 'clubName logoUrl')
      .lean();

    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    const [registeredCount, registration] = await Promise.all([
      EventRegistration.countDocuments({
        event: event._id,
        status: 'registered',
      }),
      EventRegistration.findOne({
        event: event._id,
        student: req.user._id,
        status: 'registered',
      }).lean(),
    ]);

    res.status(200).json({
      event: serializeEventDetail(event, registeredCount, Boolean(registration)),
    });
  } catch (error) {
    next(error);
  }
});

studentRouter.post('/events/:eventId/register', requireAuth, requireRole('student'), async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.eventId)) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    const event = await Event.findOne({
      _id: req.params.eventId,
      status: 'published',
    });

    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    if (event.endDateTime && event.endDateTime.getTime() <= Date.now()) {
      res.status(400).json({ message: 'Registration is closed for this event' });
      return;
    }

    const existingRegistration = await EventRegistration.findOne({
      event: event._id,
      student: req.user._id,
    });

    if (existingRegistration?.status === 'registered') {
      res.status(409).json({ message: 'You are already registered for this event' });
      return;
    }

    const registeredCount = await EventRegistration.countDocuments({
      event: event._id,
      status: 'registered',
    });

    if (event.capacity && registeredCount >= event.capacity) {
      res.status(409).json({ message: 'This event is full' });
      return;
    }

    const answers = normalizeAnswers(req.body?.answers);
    const validationMessage = validateRegistrationAnswers(event, answers);

    if (validationMessage) {
      res.status(400).json({ message: validationMessage });
      return;
    }

    if (existingRegistration) {
      existingRegistration.answers = answers;
      existingRegistration.status = 'registered';
      existingRegistration.cancelledAt = undefined;
      await existingRegistration.save();
    } else {
      await EventRegistration.create({
        event: event._id,
        student: req.user._id,
        answers,
      });
    }

    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    if (error?.code === 11000) {
      next(Object.assign(new Error('You are already registered for this event'), { statusCode: 409 }));
      return;
    }

    next(error);
  }
});

studentRouter.delete('/events/:eventId/registration', requireAuth, requireRole('student'), async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.eventId)) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    const registration = await EventRegistration.findOneAndUpdate(
      {
        event: req.params.eventId,
        student: req.user._id,
        status: 'registered',
      },
      {
        status: 'cancelled',
        cancelledAt: new Date(),
      },
      { new: true }
    );

    if (!registration) {
      res.status(404).json({ message: 'Registration not found' });
      return;
    }

    res.status(200).json({ message: 'Registration cancelled' });
  } catch (error) {
    next(error);
  }
});

studentRouter.get('/clubs', requireAuth, requireRole('student'), async (req, res, next) => {
  try {
    const query = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : 'all';
    const filters = { status: 'active' };

    if (query) {
      filters.clubName = { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    }

    if (category && category !== 'all') {
      filters.category = category;
    }

    const [clubs, student] = await Promise.all([
      Club.find(filters)
        .select('clubName description logoUrl category status followers')
        .sort({ clubName: 1 })
        .limit(100)
        .lean(),
      Student.findById(req.user._id).select('followedClubs').lean(),
    ]);
    const followedClubIds = new Set((student?.followedClubs ?? []).map((id) => String(id)));

    res.status(200).json({
      clubs: clubs.map((club) => ({
        ...serializeClub(club),
        isFollowing: followedClubIds.has(String(club._id)),
      })),
    });
  } catch (error) {
    next(error);
  }
});

studentRouter.get('/clubs/:clubId', requireAuth, requireRole('student'), async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.clubId)) {
      res.status(404).json({ message: 'Club not found' });
      return;
    }

    const [club, student] = await Promise.all([
      Club.findOne({
        _id: req.params.clubId,
        status: 'active',
      })
        .select('clubName description email logoUrl bannerUrl socialLinks category status followers')
        .lean(),
      Student.findById(req.user._id).select('followedClubs').lean(),
    ]);

    if (!club) {
      res.status(404).json({ message: 'Club not found' });
      return;
    }

    const [posts, events] = await Promise.all([
      Post.find({
        club: club._id,
        status: 'active',
      })
        .populate('club', 'clubName logoUrl')
        .sort({ isPinned: -1, _id: -1 })
        .limit(50)
        .lean(),
      Event.find({
        club: club._id,
        status: 'published',
        endDateTime: { $gte: new Date() },
      })
        .populate('club', 'clubName logoUrl')
        .sort({ startDateTime: 1 })
        .limit(50)
        .lean(),
    ]);
    const registrationCounts = events.length
      ? await EventRegistration.aggregate([
          {
            $match: {
              event: { $in: events.map((event) => event._id) },
              status: 'registered',
            },
          },
          {
            $group: {
              _id: '$event',
              count: { $sum: 1 },
            },
          },
        ])
      : [];
    const registrationCountByEventId = new Map(
      registrationCounts.map((item) => [String(item._id), item.count])
    );
    const followedClubIds = new Set((student?.followedClubs ?? []).map((id) => String(id)));

    res.status(200).json({
      club: {
        ...serializeClub(club),
        email: club.email,
        bannerUrl: club.bannerUrl ?? null,
        socialLinks: club.socialLinks ?? {},
        isFollowing: followedClubIds.has(String(club._id)),
      },
      posts: posts.map(serializePost),
      events: events.map((event) =>
        serializeEvent(event, registrationCountByEventId.get(String(event._id)) ?? 0)
      ),
    });
  } catch (error) {
    next(error);
  }
});

studentRouter.post('/clubs/:clubId/follow', requireAuth, requireRole('student'), async (req, res, next) => {
  try {
    const club = await Club.findOne({ _id: req.params.clubId, status: 'active' });

    if (!club) {
      res.status(404).json({ message: 'Club not found' });
      return;
    }

    await Promise.all([
      Student.findByIdAndUpdate(req.user._id, { $addToSet: { followedClubs: club._id } }),
      Club.findByIdAndUpdate(club._id, { $addToSet: { followers: req.user._id } }),
    ]);

    res.status(200).json({ message: 'Following club' });
  } catch (error) {
    next(error);
  }
});

studentRouter.delete('/clubs/:clubId/follow', requireAuth, requireRole('student'), async (req, res, next) => {
  try {
    await Promise.all([
      Student.findByIdAndUpdate(req.user._id, {
        $pull: {
          followedClubs: req.params.clubId,
          'notificationPreferences.clubs': { club: req.params.clubId },
        },
      }),
      Club.findByIdAndUpdate(req.params.clubId, { $pull: { followers: req.user._id } }),
    ]);

    res.status(200).json({ message: 'Unfollowed club' });
  } catch (error) {
    next(error);
  }
});
