import { Router } from 'express';
import mongoose from 'mongoose';
import Club from '../../../models/Club.js';
import ClubRequest from '../../../models/ClubRequest.js';
import Event from '../../../models/Event.js';
import EventRegistration from '../../../models/EventRegistration.js';
import Post from '../../../models/Post.js';
import { requireAuth, requireRole } from '../../middlewares/auth.middleware.js';
import { createError } from '../../utils/jwt.js';
import { notifyStudentAboutRegistrationDecision } from '../../utils/notifications.js';

export const clubRouter = Router();

const eventCategories = new Set([
  'academic',
  'technical',
  'sports',
  'volunteering',
  'cultural',
  'social',
  'other',
]);
const optionFieldTypes = new Set(['checkbox', 'radio']);

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const studentIdPattern = /^s\d{9}$/i;
const accentColorPattern = /^#[0-9a-f]{6}$/i;
const defaultAccentColor = '#1e3a5f';
const defaultBackgroundColor = '#f8fafc';
const defaultCardColor = '#ffffff';
const defaultPrimaryTextColor = '#111827';
const defaultSecondaryTextColor = '#6b7280';
const logoShapes = new Set(['circle', 'rounded-square']);

function assertObjectId(value, resourceName) {
  if (!mongoose.isValidObjectId(value)) {
    throw createError(404, `${resourceName} not found`);
  }
}

function requiredString(value, fieldName) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw createError(400, `${fieldName} is required`);
  }

  return value.trim();
}

function optionalString(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function normalizeAccentColor(value) {
  if (value === undefined || value === null || value === '') {
    return defaultAccentColor;
  }

  if (typeof value !== 'string' || !accentColorPattern.test(value.trim())) {
    throw createError(400, 'Accent color must be a valid hex color');
  }

  return value.trim().toLowerCase();
}

function normalizeBackgroundColor(value) {
  if (value === undefined || value === null || value === '') {
    return defaultBackgroundColor;
  }

  if (typeof value !== 'string' || !accentColorPattern.test(value.trim())) {
    throw createError(400, 'Background color must be a valid hex color');
  }

  return value.trim().toLowerCase();
}

function normalizeCardColor(value) {
  if (value === undefined || value === null || value === '') {
    return defaultCardColor;
  }

  if (typeof value !== 'string' || !accentColorPattern.test(value.trim())) {
    throw createError(400, 'Cards color must be a valid hex color');
  }

  return value.trim().toLowerCase();
}

function normalizePrimaryTextColor(value) {
  if (value === undefined || value === null || value === '') {
    return defaultPrimaryTextColor;
  }

  if (typeof value !== 'string' || !accentColorPattern.test(value.trim())) {
    throw createError(400, 'Primary text color must be a valid hex color');
  }

  return value.trim().toLowerCase();
}

function normalizeSecondaryTextColor(value) {
  if (value === undefined || value === null || value === '') {
    return defaultSecondaryTextColor;
  }

  if (typeof value !== 'string' || !accentColorPattern.test(value.trim())) {
    throw createError(400, 'Secondary text color must be a valid hex color');
  }

  return value.trim().toLowerCase();
}

function normalizeLogoShape(value) {
  if (value === undefined || value === null || value === '') {
    return 'circle';
  }

  if (typeof value !== 'string' || !logoShapes.has(value)) {
    throw createError(400, 'Logo shape is invalid');
  }

  return value;
}

function requireActiveClub(req) {
  if (req.user.status === 'suspended') {
    throw createError(403, 'Club account is suspended');
  }
}

function objectIdTimestamp(id) {
  return id?.getTimestamp?.() ?? new Date();
}

function serializeDashboardPost(post) {
  return serializePost(post);
}

function getPostLikes(post) {
  return Array.isArray(post.likes) ? post.likes : [];
}

function serializePost(post) {
  return {
    id: String(post._id),
    title: post.title,
    content: post.content,
    imageUrl: post.imageUrl ?? null,
    isPinned: Boolean(post.isPinned),
    likesCount: getPostLikes(post).length,
    status: post.status,
    createdAt: objectIdTimestamp(post._id).toISOString(),
  };
}

function serializeDashboardEvent(event, registeredCount) {
  return serializeEvent(event, registeredCount);
}

function serializeRegistrationField(field) {
  return {
    label: field.label,
    fieldType: field.fieldType,
    required: Boolean(field.required),
    options: field.options ?? [],
  };
}

function serializeEvent(event, registeredCount = 0) {
  return {
    id: String(event._id),
    title: event.title,
    description: event.description,
    category: event.category,
    startDateTime: event.startDateTime,
    endDateTime: event.endDateTime,
    hasStartTime: event.hasStartTime !== false,
    hasEndTime: event.hasEndTime !== false,
    location: event.location ?? '',
    capacity: event.capacity ?? null,
    imageUrl: event.imageUrl ?? null,
    registrationFields: (event.registrationFields ?? []).map(serializeRegistrationField),
    requiresRegistrationApproval: Boolean(event.requiresRegistrationApproval),
    status: event.status,
    registered: registeredCount,
    createdAt: objectIdTimestamp(event._id).toISOString(),
  };
}

function serializeEventRegistration(registration) {
  return {
    id: String(registration._id),
    studentName: registration.student.fullName,
    studentId: registration.student.studentId,
    email: registration.student.email,
    status: registration.status,
    registeredAt: objectIdTimestamp(registration._id).toISOString(),
    reviewedAt: registration.reviewedAt ?? null,
    answers: (registration.answers ?? []).map((answer) => ({
      fieldLabel: answer.fieldLabel,
      answer: answer.answer,
    })),
  };
}

function serializeProfile(club) {
  return {
    id: String(club._id),
    clubName: club.clubName,
    email: club.email,
    description: club.description,
    category: club.category,
    representativeName: club.representativeName,
    representativeEmail: club.representativeEmail,
    representativeStudentId: club.representativeStudentId,
    logoUrl: club.logoUrl ?? '',
    bannerUrl: club.bannerUrl ?? '',
    accentColor: club.accentColor ?? club.themeColor ?? defaultAccentColor,
    backgroundColor: club.backgroundColor ?? defaultBackgroundColor,
    cardColor: club.cardColor ?? defaultCardColor,
    primaryTextColor: club.primaryTextColor ?? defaultPrimaryTextColor,
    secondaryTextColor: club.secondaryTextColor ?? defaultSecondaryTextColor,
    logoShape: club.logoShape ?? 'circle',
    socialLinks: {
      instagram: club.socialLinks?.instagram ?? '',
      twitter: club.socialLinks?.twitter ?? '',
      linkedin: club.socialLinks?.linkedin ?? '',
      website: club.socialLinks?.website ?? '',
      whatsapp: club.socialLinks?.whatsapp ?? '',
    },
    status: club.status,
    suspensionReason: club.suspensionReason ?? '',
    followers: Array.isArray(club.followers) ? club.followers.length : 0,
    approvedAt: club.approvedAt ?? null,
  };
}

function parseDate(value, fieldName) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw createError(400, `${fieldName} must be a valid date and time`);
  }

  return date;
}

function normalizeRegistrationFields(fields) {
  if (!Array.isArray(fields)) {
    return [];
  }

  const normalizedFields = fields
    .map((field) => ({
      label: typeof field.label === 'string' ? field.label.trim() : '',
      fieldType: field.fieldType,
      required: Boolean(field.required),
      options: Array.isArray(field.options)
        ? field.options.map((option) => String(option).trim()).filter(Boolean)
        : [],
    }))
    .filter((field) => field.label);

  for (const field of normalizedFields) {
    if (optionFieldTypes.has(field.fieldType) && field.options.length === 0) {
      throw createError(400, `${field.label} must include at least one option`);
    }
  }

  return normalizedFields;
}

function normalizeCapacity(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const capacity = Number(value);

  if (!Number.isInteger(capacity) || capacity < 1) {
    throw createError(400, 'Capacity must be a positive whole number');
  }

  return capacity;
}

function normalizeSocialLinks(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return {};
  }

  return {
    instagram: optionalString(input.instagram),
    twitter: optionalString(input.twitter),
    linkedin: optionalString(input.linkedin),
    website: optionalString(input.website),
    whatsapp: optionalString(input.whatsapp),
  };
}

async function getRegistrationCountByEventIds(eventIds) {
  if (eventIds.length === 0) {
    return new Map();
  }

  const registrationCounts = await EventRegistration.aggregate([
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
  ]);

  return new Map(registrationCounts.map((item) => [String(item._id), item.count]));
}

async function findOwnedPost(clubId, postId) {
  assertObjectId(postId, 'Post');

  const post = await Post.findOne({
    _id: postId,
    club: clubId,
    status: 'active',
  });

  if (!post) {
    throw createError(404, 'Post not found');
  }

  return post;
}

async function findOwnedEvent(clubId, eventId) {
  assertObjectId(eventId, 'Event');

  const event = await Event.findOne({
    _id: eventId,
    club: clubId,
    status: 'published',
  });

  if (!event) {
    throw createError(404, 'Event not found');
  }

  return event;
}

function validateClubRequestInput(input) {
  const requestedEmail = requiredString(input?.requestedEmail, 'Requested club email').toLowerCase();
  const representativeEmail = requiredString(input?.representativeEmail, 'Representative email').toLowerCase();
  const representativeStudentId = requiredString(
    input?.representativeStudentId,
    'Representative student ID'
  ).toLowerCase();
  const category = requiredString(input?.category, 'Category');

  if (!eventCategories.has(category)) {
    throw createError(400, 'Category is invalid');
  }

  if (!emailPattern.test(requestedEmail)) {
    throw createError(400, 'Requested club email must be a valid email address');
  }

  if (!emailPattern.test(representativeEmail)) {
    throw createError(400, 'Representative email must be a valid email address');
  }

  if (!studentIdPattern.test(representativeStudentId)) {
    throw createError(400, 'Representative student ID must match format s123456789');
  }

  return {
    clubName: requiredString(input?.clubName, 'Club name'),
    description: requiredString(input?.description, 'Description'),
    category,
    representativeName: requiredString(input?.representativeName, 'Representative name'),
    representativeEmail,
    representativeStudentId,
    requestedEmail,
  };
}

clubRouter.post('/requests', async (req, res, next) => {
  try {
    const payload = validateClubRequestInput(req.body);

    const [existingClub, existingRequest] = await Promise.all([
      Club.findOne({
        $or: [
          { clubName: payload.clubName },
          { email: payload.requestedEmail },
        ],
      }).lean(),
      ClubRequest.findOne({
        status: { $in: ['pending', 'approved'] },
        $or: [
          { clubName: payload.clubName },
          { requestedEmail: payload.requestedEmail },
        ],
      }).lean(),
    ]);

    if (existingClub) {
      throw createError(409, 'A club with this name or email already exists');
    }

    if (existingRequest) {
      throw createError(409, 'A pending or approved request already exists for this club');
    }

    const request = await ClubRequest.create(payload);

    res.status(201).json({
      message: 'Club registration request submitted for admin review',
      request: {
        id: String(request._id),
        status: request.status,
      },
    });
  } catch (error) {
    next(error);
  }
});

clubRouter.get('/dashboard', requireAuth, requireRole('club'), async (req, res, next) => {
  try {
    const clubId = req.user._id;
    const now = new Date();

    const [club, recentPosts, upcomingEvents, totalPosts, upcomingEventCount] = await Promise.all([
      Club.findById(clubId).select('clubName followers status').lean(),
      Post.find({
        club: clubId,
        status: 'active',
      })
        .sort({ _id: -1 })
        .limit(3)
        .lean(),
      Event.find({
        club: clubId,
        status: 'published',
        endDateTime: { $gte: now },
      })
        .sort({ startDateTime: 1 })
        .limit(5)
        .lean(),
      Post.countDocuments({
        club: clubId,
        status: 'active',
      }),
      Event.countDocuments({
        club: clubId,
        status: 'published',
        endDateTime: { $gte: now },
      }),
    ]);

    if (!club) {
      throw createError(404, 'Club not found');
    }

    const eventIds = upcomingEvents.map((event) => event._id);
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

    res.status(200).json({
      club: {
        id: String(club._id),
        clubName: club.clubName,
        status: club.status,
      },
      stats: {
        followers: Array.isArray(club.followers) ? club.followers.length : 0,
        totalPosts,
        upcomingEvents: upcomingEventCount,
      },
      recentPosts: recentPosts.map(serializeDashboardPost),
      upcomingEvents: upcomingEvents.map((event) =>
        serializeDashboardEvent(event, registrationCountByEventId.get(String(event._id)) ?? 0)
      ),
    });
  } catch (error) {
    next(error);
  }
});

clubRouter.get('/profile', requireAuth, requireRole('club'), async (req, res, next) => {
  try {
    const club = await Club.findById(req.user._id).lean();

    if (!club) {
      throw createError(404, 'Club not found');
    }

    res.status(200).json({
      club: serializeProfile(club),
    });
  } catch (error) {
    next(error);
  }
});

clubRouter.patch('/profile', requireAuth, requireRole('club'), async (req, res, next) => {
  try {
    requireActiveClub(req);

    const club = await Club.findById(req.user._id);

    if (!club) {
      throw createError(404, 'Club not found');
    }

    if (req.body?.clubName !== undefined) {
      club.clubName = requiredString(req.body.clubName, 'Club name');
    }

    if (req.body?.description !== undefined) {
      club.description = requiredString(req.body.description, 'Description');
    }

    if (req.body?.category !== undefined) {
      const category = requiredString(req.body.category, 'Category');

      if (!eventCategories.has(category)) {
        throw createError(400, 'Category is invalid');
      }

      club.category = category;
    }

    if (req.body?.email !== undefined) {
      const email = requiredString(req.body.email, 'Contact email').toLowerCase();

      if (!emailPattern.test(email)) {
        throw createError(400, 'Contact email must be a valid email address');
      }

      club.email = email;
    }

    if (req.body?.logoUrl !== undefined) {
      club.logoUrl = optionalString(req.body.logoUrl);
    }

    if (req.body?.bannerUrl !== undefined) {
      club.bannerUrl = optionalString(req.body.bannerUrl);
    }

    if (req.body?.accentColor !== undefined || req.body?.themeColor !== undefined) {
      club.accentColor = normalizeAccentColor(req.body.accentColor ?? req.body.themeColor);
    }

    if (req.body?.backgroundColor !== undefined) {
      club.backgroundColor = normalizeBackgroundColor(req.body.backgroundColor);
    }

    if (req.body?.cardColor !== undefined) {
      club.cardColor = normalizeCardColor(req.body.cardColor);
    }

    if (req.body?.primaryTextColor !== undefined) {
      club.primaryTextColor = normalizePrimaryTextColor(req.body.primaryTextColor);
    }

    if (req.body?.secondaryTextColor !== undefined) {
      club.secondaryTextColor = normalizeSecondaryTextColor(req.body.secondaryTextColor);
    }

    if (req.body?.logoShape !== undefined) {
      club.logoShape = normalizeLogoShape(req.body.logoShape);
    }

    if (req.body?.socialLinks !== undefined) {
      club.socialLinks = normalizeSocialLinks(req.body.socialLinks);
    }

    const updatedClub = await club.save();

    res.status(200).json({
      message: 'Profile updated',
      club: serializeProfile(updatedClub),
    });
  } catch (error) {
    if (error?.code === 11000) {
      next(createError(409, 'A club with this name or email already exists'));
      return;
    }

    next(error);
  }
});

clubRouter.get('/posts', requireAuth, requireRole('club'), async (req, res, next) => {
  try {
    const posts = await Post.find({
      club: req.user._id,
      status: 'active',
    })
      .sort({ isPinned: -1, _id: -1 })
      .lean();

    res.status(200).json({
      posts: posts.map(serializePost),
    });
  } catch (error) {
    next(error);
  }
});

clubRouter.post('/posts', requireAuth, requireRole('club'), async (req, res, next) => {
  try {
    requireActiveClub(req);
    const shouldPinPost = Boolean(req.body?.isPinned);

    if (shouldPinPost) {
      await Post.updateMany(
        { club: req.user._id, status: 'active', isPinned: true },
        { $set: { isPinned: false } }
      );
    }

    const post = await Post.create({
      club: req.user._id,
      title: requiredString(req.body?.title, 'Post title'),
      content: requiredString(req.body?.content, 'Post content'),
      imageUrl: typeof req.body?.imageUrl === 'string' ? req.body.imageUrl.trim() : undefined,
      isPinned: shouldPinPost,
      status: 'active',
    });

    res.status(201).json({
      message: 'Post published',
      notificationDispatch: {
        inApp: 'queued',
        email: 'queued',
      },
      post: {
        id: String(post._id),
        title: post.title,
      },
    });
  } catch (error) {
    next(error);
  }
});

clubRouter.get('/posts/:postId', requireAuth, requireRole('club'), async (req, res, next) => {
  try {
    const post = await findOwnedPost(req.user._id, req.params.postId);

    res.status(200).json({
      post: serializePost(post),
    });
  } catch (error) {
    next(error);
  }
});

clubRouter.patch('/posts/:postId', requireAuth, requireRole('club'), async (req, res, next) => {
  try {
    requireActiveClub(req);

    const post = await findOwnedPost(req.user._id, req.params.postId);

    if (req.body?.title !== undefined) {
      post.title = requiredString(req.body.title, 'Post title');
    }

    if (req.body?.content !== undefined) {
      post.content = requiredString(req.body.content, 'Post content');
    }

    if (req.body?.imageUrl !== undefined) {
      post.imageUrl = optionalString(req.body.imageUrl);
    }

    if (req.body?.isPinned !== undefined) {
      post.isPinned = Boolean(req.body.isPinned);

      if (post.isPinned) {
        await Post.updateMany(
          { club: req.user._id, _id: { $ne: post._id }, status: 'active', isPinned: true },
          { $set: { isPinned: false } }
        );
      }
    }

    const updatedPost = await post.save();

    res.status(200).json({
      message: 'Post updated',
      post: serializePost(updatedPost),
    });
  } catch (error) {
    next(error);
  }
});

clubRouter.delete('/posts/:postId', requireAuth, requireRole('club'), async (req, res, next) => {
  try {
    requireActiveClub(req);

    const post = await findOwnedPost(req.user._id, req.params.postId);
    post.status = 'hidden';
    await post.save();

    res.status(200).json({
      message: 'Post deleted',
    });
  } catch (error) {
    next(error);
  }
});

clubRouter.get('/events', requireAuth, requireRole('club'), async (req, res, next) => {
  try {
    const events = await Event.find({
      club: req.user._id,
      status: 'published',
    })
      .sort({ startDateTime: 1 })
      .lean();
    const countByEventId = await getRegistrationCountByEventIds(events.map((event) => event._id));

    res.status(200).json({
      events: events.map((event) => serializeEvent(event, countByEventId.get(String(event._id)) ?? 0)),
    });
  } catch (error) {
    next(error);
  }
});

clubRouter.post('/events', requireAuth, requireRole('club'), async (req, res, next) => {
  try {
    requireActiveClub(req);

    const startDateTime = parseDate(req.body?.startDateTime, 'Start date and time');
    const endDateTime = parseDate(req.body?.endDateTime, 'End date and time');
    const hasStartTime = req.body?.hasStartTime === undefined ? true : Boolean(req.body.hasStartTime);
    const hasEndTime = req.body?.hasEndTime === undefined ? true : Boolean(req.body.hasEndTime);
    const category = typeof req.body?.category === 'string' ? req.body.category.trim() : 'other';

    if (endDateTime <= startDateTime) {
      throw createError(400, 'End date and time must be after start date and time');
    }

    if (!eventCategories.has(category)) {
      throw createError(400, 'Event category is invalid');
    }

    const event = await Event.create({
      club: req.user._id,
      title: requiredString(req.body?.title, 'Event title'),
      description: requiredString(req.body?.description, 'Event description'),
      category,
      startDateTime,
      endDateTime,
      hasStartTime,
      hasEndTime,
      location: optionalString(req.body?.location),
      capacity: normalizeCapacity(req.body?.capacity),
      imageUrl: optionalString(req.body?.imageUrl),
      registrationFields: normalizeRegistrationFields(req.body?.registrationFields),
      requiresRegistrationApproval: Boolean(req.body?.requiresRegistrationApproval),
      status: 'published',
    });

    res.status(201).json({
      message: 'Event published',
      notificationDispatch: {
        inApp: 'queued',
        email: 'queued',
      },
      event: {
        id: String(event._id),
        title: event.title,
        startDateTime: event.startDateTime,
      },
    });
  } catch (error) {
    next(error);
  }
});

clubRouter.get('/events/:eventId', requireAuth, requireRole('club'), async (req, res, next) => {
  try {
    const event = await findOwnedEvent(req.user._id, req.params.eventId);
    const registered = await EventRegistration.countDocuments({
      event: event._id,
      status: 'registered',
    });

    res.status(200).json({
      event: serializeEvent(event, registered),
    });
  } catch (error) {
    next(error);
  }
});

clubRouter.patch('/events/:eventId', requireAuth, requireRole('club'), async (req, res, next) => {
  try {
    requireActiveClub(req);

    const event = await findOwnedEvent(req.user._id, req.params.eventId);

    if (req.body?.title !== undefined) {
      event.title = requiredString(req.body.title, 'Event title');
    }

    if (req.body?.description !== undefined) {
      event.description = requiredString(req.body.description, 'Event description');
    }

    if (req.body?.category !== undefined) {
      const category = requiredString(req.body.category, 'Event category');

      if (!eventCategories.has(category)) {
        throw createError(400, 'Event category is invalid');
      }

      event.category = category;
    }

    if (req.body?.startDateTime !== undefined) {
      event.startDateTime = parseDate(req.body.startDateTime, 'Start date and time');
    }

    if (req.body?.endDateTime !== undefined) {
      event.endDateTime = parseDate(req.body.endDateTime, 'End date and time');
    }

    if (req.body?.hasStartTime !== undefined) {
      event.hasStartTime = Boolean(req.body.hasStartTime);
    }

    if (req.body?.hasEndTime !== undefined) {
      event.hasEndTime = Boolean(req.body.hasEndTime);
    }

    if (event.endDateTime <= event.startDateTime) {
      throw createError(400, 'End date and time must be after start date and time');
    }

    if (req.body?.location !== undefined) {
      event.location = optionalString(req.body.location);
    }

    if (req.body?.capacity !== undefined) {
      event.capacity = normalizeCapacity(req.body.capacity);
    }

    if (req.body?.imageUrl !== undefined) {
      event.imageUrl = optionalString(req.body.imageUrl);
    }

    if (req.body?.registrationFields !== undefined) {
      event.registrationFields = normalizeRegistrationFields(req.body.registrationFields);
    }

    if (req.body?.requiresRegistrationApproval !== undefined) {
      event.requiresRegistrationApproval = Boolean(req.body.requiresRegistrationApproval);
    }

    const updatedEvent = await event.save();
    const registered = await EventRegistration.countDocuments({
      event: updatedEvent._id,
      status: 'registered',
    });

    res.status(200).json({
      message: 'Event updated',
      event: serializeEvent(updatedEvent, registered),
    });
  } catch (error) {
    next(error);
  }
});

clubRouter.delete('/events/:eventId', requireAuth, requireRole('club'), async (req, res, next) => {
  try {
    requireActiveClub(req);

    const event = await findOwnedEvent(req.user._id, req.params.eventId);
    event.status = 'cancelled';
    await event.save();

    res.status(200).json({
      message: 'Event deleted',
    });
  } catch (error) {
    next(error);
  }
});

clubRouter.get('/events/:eventId/registrations', requireAuth, requireRole('club'), async (req, res, next) => {
  try {
    const event = await findOwnedEvent(req.user._id, req.params.eventId);
    const registrations = await EventRegistration.find({
      event: event._id,
      status: { $ne: 'cancelled' },
    })
      .populate('student', 'fullName studentId email')
      .sort({ _id: -1 })
      .lean();
    const registeredCount = registrations.filter((registration) => registration.status === 'registered').length;

    res.status(200).json({
      event: serializeEvent(event, registeredCount),
      registrations: registrations
        .filter((registration) => registration.student)
        .map(serializeEventRegistration),
    });
  } catch (error) {
    next(error);
  }
});

clubRouter.patch('/events/:eventId/registrations/:registrationId', requireAuth, requireRole('club'), async (req, res, next) => {
  try {
    requireActiveClub(req);

    const event = await findOwnedEvent(req.user._id, req.params.eventId);

    if (!mongoose.isValidObjectId(req.params.registrationId)) {
      throw createError(404, 'Registration not found');
    }

    const status = typeof req.body?.status === 'string' ? req.body.status.trim() : '';

    if (!['registered', 'declined'].includes(status)) {
      throw createError(400, 'Registration status is invalid');
    }

    const registration = await EventRegistration.findOne({
      _id: req.params.registrationId,
      event: event._id,
      status: { $in: ['pending', 'declined', 'registered'] },
    }).populate('student', 'fullName studentId email');

    if (!registration || !registration.student) {
      throw createError(404, 'Registration not found');
    }

    if (status === 'registered' && registration.status !== 'registered') {
      const registeredCount = await EventRegistration.countDocuments({
        event: event._id,
        status: 'registered',
      });

      if (event.capacity && registeredCount >= event.capacity) {
        throw createError(409, 'This event is full');
      }
    }

    registration.status = status;
    registration.reviewedAt = new Date();
    registration.cancelledAt = undefined;
    await registration.save();

    await notifyStudentAboutRegistrationDecision({
      studentId: registration.student._id,
      clubId: req.user._id,
      eventId: event._id,
      eventTitle: event.title,
      status,
    });

    res.status(200).json({
      message: status === 'registered' ? 'Registration approved' : 'Registration declined',
      registration: serializeEventRegistration(registration),
    });
  } catch (error) {
    next(error);
  }
});

clubRouter.get('/followers', requireAuth, requireRole('club'), async (req, res, next) => {
  try {
    const club = await Club.findById(req.user._id)
      .select('followers')
      .populate('followers', 'fullName studentId email')
      .lean();

    if (!club) {
      throw createError(404, 'Club not found');
    }

    const followers = (club.followers ?? []).filter(Boolean);
    const studentIds = followers.map((student) => student._id);
    const clubEvents = await Event.find({
      club: req.user._id,
    })
      .select('_id')
      .lean();
    const registrationCounts = clubEvents.length
      ? await EventRegistration.aggregate([
          {
            $match: {
              event: { $in: clubEvents.map((event) => event._id) },
              student: { $in: studentIds },
              status: 'registered',
            },
          },
          {
            $group: {
              _id: '$student',
              count: { $sum: 1 },
            },
          },
        ])
      : [];
    const registrationsByStudentId = new Map(
      registrationCounts.map((item) => [String(item._id), item.count])
    );
    const serializedFollowers = followers.map((student) => ({
      id: String(student._id),
      name: student.fullName,
      studentId: student.studentId,
      email: student.email,
      registeredEvents: registrationsByStudentId.get(String(student._id)) ?? 0,
    }));

    res.status(200).json({
      stats: {
        totalFollowers: serializedFollowers.length,
        totalEventRegistrations: serializedFollowers.reduce(
          (sum, follower) => sum + follower.registeredEvents,
          0
        ),
      },
      followers: serializedFollowers,
    });
  } catch (error) {
    next(error);
  }
});
