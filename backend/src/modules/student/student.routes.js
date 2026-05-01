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
const optionFieldTypes = new Set(['checkbox', 'radio']);
const defaultAccentColor = '#1e3a5f';
const defaultBackgroundColor = '#f8fafc';
const defaultCardColor = '#ffffff';
const defaultPrimaryTextColor = '#111827';
const defaultSecondaryTextColor = '#6b7280';
const minClubSearchQueryLength = 2;

function objectIdTimestamp(id) {
  return id?.getTimestamp?.() ?? new Date();
}

function serializeClub(club) {
  return {
    id: String(club._id),
    clubName: club.clubName,
    description: club.description,
    logoUrl: club.logoUrl ?? null,
    accentColor: club.accentColor ?? club.themeColor ?? defaultAccentColor,
    backgroundColor: club.backgroundColor ?? defaultBackgroundColor,
    cardColor: club.cardColor ?? defaultCardColor,
    primaryTextColor: club.primaryTextColor ?? defaultPrimaryTextColor,
    secondaryTextColor: club.secondaryTextColor ?? defaultSecondaryTextColor,
    logoShape: club.logoShape ?? 'circle',
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
    notificationsEnabled: preference?.notificationsEnabled !== false && preference?.inApp !== false,
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
        notificationsEnabled: preferences.notificationsEnabled,
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

function getPostLikes(post) {
  return Array.isArray(post.likes) ? post.likes : [];
}

function serializePost(post, studentId) {
  const likes = getPostLikes(post);

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
    likesCount: likes.length,
    isLiked: studentId ? likes.some((id) => String(id) === String(studentId)) : false,
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
    hasStartTime: event.hasStartTime !== false,
    hasEndTime: event.hasEndTime !== false,
    location: event.location ?? '',
    capacity: event.capacity ?? null,
    registered: registeredCount,
    imageUrl: event.imageUrl ?? null,
    requiresRegistrationApproval: Boolean(event.requiresRegistrationApproval),
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

function serializeEventDetail(event, registeredCount, registrationStatus) {
  return {
    ...serializeEvent(event, registeredCount),
    description: event.description,
    registrationFields: (event.registrationFields ?? []).map(serializeRegistrationField),
    isRegistered: ['registered', 'pending'].includes(registrationStatus),
    registrationStatus: registrationStatus ?? null,
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

  if (registrationStatus === 'pending') {
    return 'pending';
  }

  if (registrationStatus === 'declined') {
    return 'declined';
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
    hasStartTime: event.hasStartTime !== false,
    hasEndTime: event.hasEndTime !== false,
    location: event.location ?? '',
    capacity: event.capacity ?? null,
    status: getRegistrationStatus(event, registration.status),
    registrationStatus: registration.status,
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

function getClubSearchRank(club, query) {
  if (!query) {
    return 0;
  }

  const name = String(club.clubName ?? '').toLowerCase();

  if (name === query) {
    return 0;
  }

  if (name.startsWith(query)) {
    return 1;
  }

  return 2;
}

function isStudentIdField(label = '') {
  const normalized = String(label).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  return normalized.includes('student id') || normalized.includes('kfupm id');
}

function validateRegistrationAnswers(event, answers) {
  const answersByLabel = new Map(answers.map((answer) => [answer.fieldLabel, answer.answer]));

  for (const field of event.registrationFields ?? []) {
    const value = answersByLabel.get(field.label);
    const options = Array.isArray(field.options)
      ? field.options.map((option) => String(option)).filter(Boolean)
      : [];

    if (field.required && !value) {
      return `${field.label} is required`;
    }

    if (field.fieldType === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return `${field.label} must be a valid email address`;
    }

    if (isStudentIdField(field.label) && value && !/^s\d{9}$/i.test(String(value).trim())) {
      return `${field.label} must match format s123456789`;
    }

    if (optionFieldTypes.has(field.fieldType) && value && options.length > 0) {
      const selectedOptions =
        field.fieldType === 'checkbox'
          ? String(value)
              .split(',')
              .map((option) => option.trim())
              .filter(Boolean)
          : [String(value).trim()];

      if (selectedOptions.some((option) => !options.includes(option))) {
        return `${field.label} has an invalid option`;
      }
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

async function updatePostLike(postId, studentId, shouldLike) {
  if (!mongoose.isValidObjectId(postId)) {
    throw createError(404, 'Post not found');
  }

  const post = await Post.findOneAndUpdate(
    {
      _id: postId,
      status: 'active',
    },
    shouldLike ? { $addToSet: { likes: studentId } } : { $pull: { likes: studentId } },
    { new: true }
  )
    .populate('club', 'clubName logoUrl')
    .lean();

  if (!post) {
    throw createError(404, 'Post not found');
  }

  return serializePost(post, studentId);
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
          notificationsEnabled:
            typeof requested.notificationsEnabled === 'boolean'
              ? requested.notificationsEnabled
              : existing.notificationsEnabled,
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
      ...posts.map((post) => serializePost(post, req.user._id)),
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

studentRouter.post('/posts/:postId/like', requireAuth, requireRole('student'), async (req, res, next) => {
  try {
    const post = await updatePostLike(req.params.postId, req.user._id, true);

    res.status(200).json({
      message: 'Post liked',
      post,
    });
  } catch (error) {
    next(error);
  }
});

studentRouter.delete('/posts/:postId/like', requireAuth, requireRole('student'), async (req, res, next) => {
  try {
    const post = await updatePostLike(req.params.postId, req.user._id, false);

    res.status(200).json({
      message: 'Post unliked',
      post,
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
      status: { $in: ['pending', 'registered', 'declined'] },
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
        status: { $ne: 'cancelled' },
      }).lean(),
    ]);

    res.status(200).json({
      event: serializeEventDetail(event, registeredCount, registration?.status ?? null),
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

    if (existingRegistration?.status === 'pending') {
      res.status(409).json({ message: 'Your registration request is pending review' });
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

    const registrationStatus = event.requiresRegistrationApproval ? 'pending' : 'registered';

    if (existingRegistration) {
      existingRegistration.answers = answers;
      existingRegistration.status = registrationStatus;
      existingRegistration.reviewedAt = undefined;
      existingRegistration.cancelledAt = undefined;
      await existingRegistration.save();
    } else {
      await EventRegistration.create({
        event: event._id,
        student: req.user._id,
        answers,
        status: registrationStatus,
      });
    }

    res.status(201).json({
      message: event.requiresRegistrationApproval
        ? 'Registration request submitted for club review'
        : 'Registration successful',
      status: registrationStatus,
    });
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
        status: { $in: ['pending', 'registered'] },
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
    const query = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : 'all';
    const filters = { status: 'active' };

    if (query && query.length < minClubSearchQueryLength) {
      res.status(200).json({
        clubs: [],
        message: `Enter at least ${minClubSearchQueryLength} characters to search clubs`,
      });
      return;
    }

    if (query) {
      filters.clubName = { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    }

    if (category && category !== 'all') {
      filters.category = category;
    }

    const [clubs, student] = await Promise.all([
      Club.find(filters)
        .select('clubName description logoUrl accentColor backgroundColor cardColor primaryTextColor secondaryTextColor logoShape category status followers')
        .limit(100)
        .lean(),
      Student.findById(req.user._id).select('followedClubs').lean(),
    ]);
    const followedClubIds = new Set((student?.followedClubs ?? []).map((id) => String(id)));
    const rankedClubs = clubs.sort((a, b) => {
      const rankDifference = getClubSearchRank(a, query) - getClubSearchRank(b, query);

      if (rankDifference !== 0) {
        return rankDifference;
      }

      const followerDifference = (b.followers?.length ?? 0) - (a.followers?.length ?? 0);

      if (followerDifference !== 0) {
        return followerDifference;
      }

      return String(a.clubName).localeCompare(String(b.clubName));
    });

    res.status(200).json({
      clubs: rankedClubs.map((club) => ({
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
        .select('clubName description email logoUrl bannerUrl accentColor backgroundColor cardColor primaryTextColor secondaryTextColor logoShape socialLinks category status followers')
        .populate('followers', 'fullName studentId')
        .lean(),
      Student.findById(req.user._id).select('followedClubs notificationPreferences').lean(),
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
    const notificationPreference = getClubPreference(student, club._id);

    res.status(200).json({
      club: {
        ...serializeClub(club),
        email: club.email,
        bannerUrl: club.bannerUrl ?? null,
        socialLinks: club.socialLinks ?? {},
        followersList: (club.followers ?? []).map((follower) => ({
          id: String(follower._id),
          fullName: follower.fullName,
          studentId: follower.studentId,
        })),
        isFollowing: followedClubIds.has(String(club._id)),
        notificationsEnabled: notificationPreference.notificationsEnabled,
      },
      posts: posts.map((post) => serializePost(post, req.user._id)),
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
      Student.findByIdAndUpdate(req.user._id, {
        $addToSet: { followedClubs: club._id },
        $pull: { 'notificationPreferences.clubs': { club: club._id } },
      }),
      Club.findByIdAndUpdate(club._id, { $addToSet: { followers: req.user._id } }),
    ]);

    await Student.findByIdAndUpdate(req.user._id, {
      $addToSet: {
        'notificationPreferences.clubs': {
          club: club._id,
          email: true,
          inApp: true,
          notificationsEnabled: true,
        },
      },
    });

    res.status(200).json({ message: 'Following club', notificationsEnabled: true });
  } catch (error) {
    next(error);
  }
});

studentRouter.patch('/clubs/:clubId/notifications', requireAuth, requireRole('student'), async (req, res, next) => {
  try {
    const notificationsEnabled = Boolean(req.body?.notificationsEnabled);
    const club = await Club.findOne({ _id: req.params.clubId, status: 'active' }).select('_id').lean();

    if (!club) {
      res.status(404).json({ message: 'Club not found' });
      return;
    }

    const student = await Student.findById(req.user._id).select('followedClubs notificationPreferences');
    const isFollowing = (student.followedClubs ?? []).some((clubId) => String(clubId) === String(club._id));

    if (!isFollowing) {
      throw createError(400, 'Follow the club before changing notifications');
    }

    const preferences = student.notificationPreferences ?? { email: 'on', clubs: [] };
    const clubs = preferences.clubs ?? [];
    const existingPreference = clubs.find((item) => String(item.club) === String(club._id));

    if (existingPreference) {
      existingPreference.inApp = notificationsEnabled;
      existingPreference.notificationsEnabled = notificationsEnabled;
    } else {
      clubs.push({
        club: club._id,
        email: true,
        inApp: notificationsEnabled,
        notificationsEnabled,
      });
    }

    student.notificationPreferences = {
      email: normalizeGlobalEmailPreference(preferences.email),
      clubs,
    };

    await student.save();

    res.status(200).json({
      message: notificationsEnabled ? 'Notifications enabled' : 'Notifications disabled',
      notificationsEnabled,
    });
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
